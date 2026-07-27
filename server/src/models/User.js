model User {
  id          String @id @default (cuid())
  name        String
  email       String @unique
  password    String
  role        UserRole

  avatar      String ?
        bio         String ?
            location    String ?

                companyId   String ?

                    company      Company ? @relation(fields: [companyId], references: [id])

  jobs         Job[]
  applications Application[]
  bookmarks    Bookmark[]
  resume       Resume ?

        createdAt   DateTime @default (now())
  updatedAt   DateTime @updatedAt

    @@index([email])
}