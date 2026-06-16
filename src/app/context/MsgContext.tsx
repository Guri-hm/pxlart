import { createContext } from 'react';
import { AlertMessageType } from '../components/alertTypes';

interface ContextInterface {
    msg: AlertMessageType,
    setMsg: any
}
export const MsgContext = createContext({} as ContextInterface);
