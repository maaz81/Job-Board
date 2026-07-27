model Resume {

  id             String @id @default (cuid())

  userId         String @unique

  fileUrl        String

  extractedText  String ?

        user User @relation(fields: [userId], references: [id])

  createdAt DateTime @default (now())

  updatedAt DateTime @updatedAt
}