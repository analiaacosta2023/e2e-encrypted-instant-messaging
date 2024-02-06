import {ChatTypeEnum} from "../constants/chat";

export interface ContactType{
    type: ChatTypeEnum,
    data: {
        alias: string;
        publicName?: string | null;
        pubkey: string;
    },
    isMuted: boolean
}