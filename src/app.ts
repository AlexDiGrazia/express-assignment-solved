import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";

const app = express();
app.use(express.json());
app.use(errorHandleMiddleware);

//Example endpoint
app.get("/", (req, res) => {
  res.status(200).send({ message: "Hello World!" });
});

//Index endpoint
app.get("/dogs", async (req, res) => {
  const allDogs = await prisma.dog.findMany();
  return res.status(200).send(allDogs);
});

//Show endpoint
app.get("/dogs/:id", async (req, res) => {
  const id = +req.params.id;

  if (Number.isNaN(id)) {
    res
      .status(400)
      .send({ message: "id should be a number" });
  }

  const dog = await Promise.resolve()
    .then(() =>
      prisma.dog.findUnique({
        where: {
          id,
        },
      })
    )
    .catch(() => null);

  if (dog === null) {
    return res.status(204).send({ error: "Dog not found" });
  }

  return res.status(200).send(dog);
});

// Create endpoint
app.post("/dogs", async (req, res) => {
  const body = req.body;
  const age = body.age;
  const name = body.name;
  const description = body.description;
  const breed = body.breed;
  const validKeys = ["name", "description", "breed", "age"];
  const errorsArray = [];

  try {
    const newDog = await prisma.dog.create({
      data: {
        name,
        description,
        breed,
        age,
      },
    });
    res.status(201).send(newDog);
  } catch {
    for (const key in body) {
      if (!validKeys.includes(key)) {
        errorsArray.push(`'${key}' is not a valid key`);
      }
    }
    if (!Number.isInteger(age)) {
      errorsArray.push("age should be a number");
    }
    if (typeof name !== "string") {
      errorsArray.push("name should be a string");
    }
    if (typeof description !== "string") {
      errorsArray.push("description should be a string");
    }
    res.status(400).send({ errors: errorsArray });
  }
});

//Delete endpoint
app.delete("/dogs/:id", async (req, res) => {
  const id = +req.params.id;

  if (!Number.isInteger(id)) {
    return res
      .status(400)
      .send({ message: "id should be a number" });
  }

  const deletedDog = await Promise.resolve()
    .then(() =>
      prisma.dog.delete({
        where: {
          id,
        },
      })
    )
    .catch(() => null);

  if (deletedDog === null) {
    return res
      .status(204)
      .send({ message: "dog not found" });
  }
  return res.status(200).send(deletedDog);
});

app.patch("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  const body = req.body;
  const validKeys = ["name", "description", "breed", "age"];
  const errorsArray = [];

  try {
    const update = await prisma.dog.update({
      where: {
        id,
      },
      data: body,
    });
    res.status(201).send(update);
  } catch {
    for (const key in body) {
      if (!validKeys.includes(key)) {
        errorsArray.push(`'${key}' is not a valid key`);
      }
    }
    return res.status(400).send({ errors: errorsArray });
  }
});

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
