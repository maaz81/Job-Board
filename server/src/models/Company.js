model Company {
  id          String @id @default (cuid())

  name        String
  logo        String ?
        website     String ?
            description String ?
                location    String ?

                    users       User[]
  jobs        Job[]

  createdAt   DateTime @default (now())
  updatedAt   DateTime @updatedAt
}