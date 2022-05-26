import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create a new User", async () => {
    const user = await createUserUseCase.execute({
      email: "test@test.com",
      name: "test name",
      password: "123456"
    });

    expect(user).toHaveProperty("id");
  });

  it("Should not be able to create a new user if the email is already registered", () => {
    expect(async () => {
      await createUserUseCase.execute({
        email: "test@test.com",
        name: "test name",
        password: "123456"
      });

      await createUserUseCase.execute({
        email: "test@test.com",
        name: "test name",
        password: "123456"
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
