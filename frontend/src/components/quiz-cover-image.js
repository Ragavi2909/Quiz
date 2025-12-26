"use client"

import { useEffect, useMemo, useState } from "react"
import { getQuizIllustrationDataUrl } from "@/lib/quiz-illustrations"
import { cn } from "@/lib/utils"

const isImageUrl = (url) => typeof url === "string" && url.length > 0

export function QuizCoverImage({ quiz, className }) {
  const illustration = useMemo(
    () => getQuizIllustrationDataUrl({ title: quiz?.title, topic: quiz?.topic }),
    [quiz?.title, quiz?.topic],
  )

  const remoteSrc = isImageUrl(quiz?.imageUrl) ? quiz.imageUrl : ""
  const [remoteVisible, setRemoteVisible] = useState(isImageUrl(remoteSrc))

  useEffect(() => {
    setRemoteVisible(isImageUrl(remoteSrc))
  }, [remoteSrc])

  return (
    <>
      <img
        src={illustration}
        alt={quiz?.title || "Quiz cover"}
        className={cn("absolute inset-0 h-full w-full", className)}
        draggable={false}
      />
      {remoteVisible ? (
        <img
          src={remoteSrc}
          alt={quiz?.title || "Quiz cover"}
          className={cn("absolute inset-0 h-full w-full", className)}
          draggable={false}
          onError={() => setRemoteVisible(false)}
        />
      ) : null}
    </>
  )
}
