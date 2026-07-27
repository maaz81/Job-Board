model RecruiterProfile {

  id String @id @default (cuid())

  userId String @unique

  companyId String

  designation String

  user User @relation(fields: [userId], references: [id])

  company Company @relation(fields: [companyId], references: [id])

}