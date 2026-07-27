model Application {

  id String @id @default (cuid())

  userId String

  jobId String

  coverLetter String ?

        status ApplicationStatus @default (APPLIED)

  aiScore Float ?

        user User @relation(fields: [userId], references: [id])

  job Job @relation(fields: [jobId], references: [id])

  createdAt DateTime @default (now())

  updatedAt DateTime @updatedAt

    @@unique([userId, jobId])

    @@index([status])
}