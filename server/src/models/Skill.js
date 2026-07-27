model Skill {

  id String @id @default (cuid())

  name String @unique

  users User[]

  jobs Job[]
}