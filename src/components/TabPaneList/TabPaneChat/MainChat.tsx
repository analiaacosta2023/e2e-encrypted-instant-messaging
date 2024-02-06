import React, {useContext, useEffect, useState} from 'react';
import HeaderSection from "../../HeaderSection";
import {ChatType, ScreenChatType} from "../../../types/chat.type";
import IconPortal from "../../IconPortal";
import IconChat from "../../../assets/icons/icon-new-chat.svg";
import {DividerTab} from "../commonStyle";
import ChatItemCp from "../../ChatItemCp";
import styled from "styled-components";
import {TextLarge, TextSmall} from "../../Typhography";
import {ScreenChatEnum} from "../../../constants/chat";
import FormInputSearch from "../../FormInputSearch";
import {eventsProviderContext} from "../../../providers/EventsProvider";
import {ContactType} from "../../../entities/ContactType";
import {ChatTypeEnum} from "../../../constants/chat";
import {userProviderContext} from "../../../providers/UserProvider"

const mockData: ContactType[] = [
    {
        type: ChatTypeEnum.USER,
        data: {
            alias: 'user1',
            publicName: 'UserType 1',
            pubkey: '21e951ac2bf9dc51afd2f74ae6330e0a47db7fa9203b108ac6bf16bc038e8des'
        },
        isMuted: true,
    },
    {
        type: ChatTypeEnum.GROUP,
        data: {
            alias: 'group1',
            publicName: 'GROUP 1',
            pubkey: '21e951ac2bf9dc51afd2f74ae6330e0a47db7fa9203b108ac6bf16bc038e8des'
        },
        isMuted: false,
    }
]

interface PropsTypeMainChat {
    goTo: (screen: ScreenChatType) => void;
}

const MainChat = ({goTo}: PropsTypeMainChat) => {
    const [term, setTerm] = useState<string>('')
    const onChange = (valueSearch: string) => {
        setTerm(valueSearch)
    }

    const [chatList, setChatList] = useState<ContactType[]>()
    const {getContacts} = useContext(eventsProviderContext)
    const {client} = useContext(userProviderContext)

    useEffect(()=>{
        handleContacts().then(() => console.log('handleContacts loaded'))
    }, [client])

    const handleContacts = async ()=> {

        const {contacts} = await getContacts()

        if (contacts){
            const ContactsListDTO: ContactType[] = contacts.map((contact)=> {

            return {
                type: ChatTypeEnum.USER,
                data: {
                    alias: contact.tags[3],
                    publicName: 'Public Name or alias',
                    pubkey: contact.pubkey
                },
                isMuted: false,
            }
            })

            setChatList(ContactsListDTO)

            console.log('chat list dto', chatList)
        }
    }

    return (
        <MainChatBox>
            <Header>
                <DivFlex>
                    <HeaderSection title={'Chat'}/>
                    <GroupActions>
                        <ItemAction onClick={() => goTo(ScreenChatEnum.NEW_CHAT as ScreenChatType)}>
                            <IconPortal srcIcon={IconChat}/>
                        </ItemAction>
                    </GroupActions>
                </DivFlex>
                <BoxSearch>
                    <FormInputSearch placeholder={'Search...'} id={'newChat'} name={'newChat'} value={term}
                                     onChange={onChange}/>
                </BoxSearch>
            </Header>
            <DividerTab/>
            <NoMessage>
                <TextNo>
                    No chat messages yet!
                </TextNo>
                <Description>
                    Once you start a new conversation,
                    you’ll see it listed here.
                </Description>
            </NoMessage>
            <ListMessage>
                {
                    mockData.map((item, index) => {
                        return <React.Fragment key={index}>
                            <ChatItemCp type={item.type} data={item.data} isMuted={item?.isMuted}/>
                        </React.Fragment>
                    })
                }
                {chatList &&
                    chatList.map((item, index) => {
                        return <React.Fragment key={index}>
                            <ChatItemCp type={item.type} data={item.data} isMuted={item?.isMuted}/>
                        </React.Fragment>
                    })
                }
            </ListMessage>
        </MainChatBox>
    );
};
const MainChatBox = styled.div`
  height: 100%;
`
const Header = styled.div`
  padding-right: 16px;
`
const DivFlex = styled.div`
  ${({theme}) => theme.flexRowCenterVertical};
`
const GroupActions = styled.div`
  ${({theme}) => theme.flexRowCenterVertical};
  gap: 16px;
  margin-left: auto;
`
const ItemAction = styled.div`
  cursor: pointer;
`
const NoMessage = styled.div`
  max-width: 230px;
  width: 100%;
  text-align: center;
  margin: 40px auto;
`
const TextNo = styled(TextLarge)`
  color: ${({theme}) => theme.secondaryTextLight};
  margin-bottom: 20px;
`
const Description = styled(TextSmall)`
  color: ${({theme}) => theme.disabledEleLight};
`
const ListMessage = styled.div`
`
const BoxSearch = styled.div`
  margin-left: 16px;
  margin-bottom: 16px;
`
export default MainChat;
