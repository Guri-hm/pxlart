import { MsgContext } from './MsgContext'
import { AlertMessageType } from '../components/alertTypes';

type Props = {
  msg: AlertMessageType,
  setMsg: any,
  children: React.ReactNode
}

const MsgProvider = ({ msg, setMsg, children }: Props) => {
  return <MsgContext.Provider value={{ msg, setMsg }}>{children}</MsgContext.Provider>
}

export default MsgProvider