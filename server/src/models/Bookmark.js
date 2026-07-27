model Bookmark {

  id String @id @default (cuid())

  userId String

  jobId String

  user User @relation(fields: [userId], references: [id])

  job Job @relation(fields: [jobId], references: [id])

  createdAt DateTime @default (now())

    @@unique([userId, jobId])
}