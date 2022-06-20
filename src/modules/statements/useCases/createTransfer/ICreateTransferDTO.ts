import { OperationType } from "../../entities/Statement";

export default interface ICreateTransferDTO {
  amount: number;
  description: string;
  type: OperationType;
  user_id: string;
  sender_id: string;
}
