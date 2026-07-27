model Job {
  id          String @id @default (cuid())

  recruiterId String
  companyId   String

  title       String
  description String

  location    String

  salary      Int ?

        experience  String ?

            jobType     JobType

  workMode    WorkMode

  status      JobStatus @default (OPEN)

  recruiter   User @relation(fields: [recruiterId], references: [id])

  company      Company @relation(fields: [companyId], references: [id])

  applications Application[]

  bookmarks    Bookmark[]

  aiAnalysis   AIAnalysis ?

        createdAt    DateTime @default (now())
  updatedAt    DateTime @updatedAt

    @@index([title])

    @@index([location])

    @@index([status])
}