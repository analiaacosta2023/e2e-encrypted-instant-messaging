import {createContext, useContext, useEffect, useState} from 'react'
import {Event, Filter, nip04_decrypt, PublicKey, Timestamp} from "@rust-nostr/nostr-sdk";
import {userProviderContext} from './UserProvider'
import {EventJsonType} from "../entities/EventJsonType";
import {string} from "yup";

export const ECHO_PREFIX = 'Echo,.12;:'

export interface EventsState {
    getMetadata: () => Promise<{ result: boolean; metadata?: EventJsonType [] }>
    getNotes: () => Promise<{ result: boolean; notes?: EventJsonType [] }>
    getContacts: () => Promise<{ result: boolean; contacts?: EventJsonType [] }>
    getPrivateMessages: (contactPublicKey: string) => Promise<{ result: boolean; privateMessages?: EventJsonType [] }>
    error: string | undefined
    contactsList: EventJsonType [] | undefined
}
export const eventsProviderContext = createContext<EventsState>({

    getMetadata: async () => {
        return {result: false}
    },

    getNotes: async ()=>{
        return {result: false}
    },

    getContacts: async  ()=>{
        return {result: false}
    },

    getPrivateMessages: async (contactPublicKey: string)=> {
        return {result: false}
    },
    error: undefined,
    contactsList: undefined

})

const EventsProvider = ({children}: { children: any })=> {

    const [error, setError] = useState<string | undefined>(undefined)
    const [contactsList, setContactsList] = useState<EventJsonType [] | undefined>()

    const {client, keys} = useContext(userProviderContext)

    useEffect(()=> {

        getContacts().then(()=> {
            console.log('Contacts loaded', contactsList);
        });

    }, [client, keys])

    const getMetadata = async ()=>{
        if (!client || !keys) return {result: false}

        try {
            const filter = new Filter().pubkey(keys.publicKey).kind(0);
            const events = await client.getEventsOf([filter], 10);
            const metadata: EventJsonType []= events.map((event) => { return  JSON.parse(event.asJson())})
            return  {result: true, metadata}
        } catch(e: any){
            setError(e.message )
        }
    return {result: false}
    }

    const getNotes = async ()=> {
        if (!client || !keys) return {result: false}

        try {
            let subscriptions: PublicKey[] = [];

            const {contacts} = await getContacts()

            if(contacts) {
                subscriptions = contacts.map((contact)=> {
                    return PublicKey.fromHex(contact.pubkey)
                })
            }

            const filter = new Filter().authors([keys.publicKey, ...subscriptions]).kind(1).until(Timestamp.now());
            const events = await client.getEventsOf([filter], 10);
            const notes: EventJsonType[] = events.map((event) => {
                return JSON.parse(event.asJson())
            })
            return {result: true, notes}
        } catch (e: any ){
            setError(e.message )
        }
        return {result: false}
    }

    const getContacts = async ()=> {
        if (!client || !keys) return {result: false}

        try {
            const filter = new Filter().pubkey(keys.publicKey).kind(3)
            const events = await client.getEventsOf([filter], 10);
            const contacts: EventJsonType[] = events.map((event) => {
                return JSON.parse(event.asJson())
            })
        setContactsList(contacts)
            return {result: true, contacts}
        }catch (e: any){
            setError(e.message)
        }
        return {result: false}
    }

    const getPrivateMessages = async (contactPublicKey: string)=> {
        if (!client || !keys) return {result: false}

        try {
            const aliasPublicKey = PublicKey.fromHex(contactPublicKey)
            const filterReceived = new Filter().pubkey(keys.publicKey).author(aliasPublicKey).kind(4).until(Timestamp.now()).limit(100);
            const filterSent = new Filter().pubkey(aliasPublicKey).author(keys.publicKey).kind(4).until(Timestamp.now()).limit(100);

            const filterEcho = new Filter().pubkey(keys.publicKey).author(keys.publicKey).kind(4).until(Timestamp.now()).limit(100);


            const receivedDMs = await client.getEventsOf([filterReceived], 10);

            const sendDms = await client.getEventsOf([filterSent], 10);

            const sendDmsMap: Map<string, Event> = sendDms.reduce((previousValue: Map<string, Event>, currentValue) => previousValue.set(currentValue.id.toHex(), currentValue), new Map())

            const echoDms = await client.getEventsOf([filterEcho], 10);

            let privateMessages: EventJsonType[] = []

            try {

                echoDms.filter((event)=>{
                    const eventRef = event.tags.find((el: any) => !!el.p)
                    console.log('soy la referencia al event', event.tags, eventRef)
                    if (eventRef && 'e' in eventRef && (typeof eventRef.e === 'string' && sendDmsMap.get(eventRef.e))) return event;
                })

                privateMessages = receivedDMs.map((event) => {
                    const eventJson = JSON.parse(event.asJson())
                    eventJson.content = nip04_decrypt(keys.secretKey, event.author, event.content);
                    /*if (!eventJson.content.startsWith(ECHO_PREFIX)) {
                        console.log('no empiezo con el prefijo echo')
                        const eventRef = eventJson.tags.find((el: any) => !!el.p)
                        console.log('soy la referencia al event', eventJson.tags, eventRef)
                        if (eventRef && 'e' in eventRef && !(sendDmsMap.get(eventRef.e)))
                            client.sendDirectMsg(PublicKey.fromHex(eventJson.pubkey), ECHO_PREFIX + eventJson.content, event.id);
                    }*/

                    return eventJson
                }).concat(echoDms.map((event) => {
                    const eventJson = JSON.parse(event.asJson())
                    eventJson.content = nip04_decrypt(keys.secretKey, event.author, event.content);
return eventJson
                }))


            } catch (e: any) {
                console.log(e)
            }

            console.log('private messages', privateMessages)

            return {result: true, privateMessages}
        } catch (e: any) {
            setError(e.message)
        }
        return {result: false}
    }

    return (
        <eventsProviderContext.Provider
            value={{getMetadata, getNotes,  getPrivateMessages, error, contactsList, getContacts}}>
            {children}
        </eventsProviderContext.Provider>
    )
}

export default EventsProvider