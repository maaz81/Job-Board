model CandidateProfile {

  id String @id @default (cuid())

  userId String @unique

  headline String ?

        bio String ?

            yearsExperience Int ?

                currentRole String ?

                    expectedSalary Int ?

                        portfolio String ?

                            linkedin String ?

                                github String ?

                                    website String ?

                                        resume Resume ?

                                            applications Application[]

  skills CandidateSkill[]

  analyses AIAnalysis[]

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

}