import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get statement operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("Should be able to return a statement operation", async () => {
    const user: ICreateUserDTO = {
      email: "test@test.com",
      name: "test name",
      password: "123456"
    };

    await createUserUseCase.execute(user);

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    const user_id = authenticatedUser.user.id!;

    const createdStatement = await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Test deposit statement"
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: createdStatement.user_id,
      statement_id: createdStatement.id!
    });

    expect(statementOperation).toHaveProperty("id");
  });

  it("Should not be able to return the statement if the user id does not exist", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        email: "test@test.com",
        name: "test name",
        password: "123456"
      };

      await createUserUseCase.execute(user);

      const authenticatedUser = await authenticateUserUseCase.execute({
        email: user.email,
        password: user.password
      });

      const user_id = authenticatedUser.user.id!;

      const createdStatement = await createStatementUseCase.execute({
        user_id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "Test deposit statement"
      });

      await getStatementOperationUseCase.execute({
        user_id: "invalid_id",
        statement_id: createdStatement.id!
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to return the statement if the statement id does not exist", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        email: "test@test.com",
        name: "test name",
        password: "123456"
      };

      await createUserUseCase.execute(user);

      const authenticatedUser = await authenticateUserUseCase.execute({
        email: user.email,
        password: user.password
      });

      const user_id = authenticatedUser.user.id!;

      const createdStatement = await createStatementUseCase.execute({
        user_id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "Test deposit statement"
      });

      await getStatementOperationUseCase.execute({
        user_id: createdStatement.user_id,
        statement_id: "invalid_id"
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
