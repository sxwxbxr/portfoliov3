"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Skill {
  name: string
  level: number
  category: string
}

const skills: Skill[] = [
  { name: "C#/.NET", level: 95, category: "Backend" },
  { name: "TypeScript", level: 88, category: "Frontend" },
  { name: "SQL Server", level: 92, category: "Database" },
  { name: "Azure", level: 85, category: "Cloud" },
  { name: "React", level: 82, category: "Frontend" },
  { name: "Docker", level: 78, category: "DevOps" },
]

export function SkillProgress() {
  const [visibleSkills, setVisibleSkills] = useState<boolean[]>(new Array(skills.length).fill(false))
  const [animatedLevels, setAnimatedLevels] = useState<number[]>(new Array(skills.length).fill(0))
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Animate skills one by one
          skills.forEach((_, index) => {
            setTimeout(() => {
              setVisibleSkills((prev) => {
                const newVisible = [...prev]
                newVisible[index] = true
                return newVisible
              })

              // Animate progress bar
              let currentLevel = 0
              const targetLevel = skills[index].level
              const increment = targetLevel / 30 // 30 frames for smooth animation

              const animateProgress = () => {
                currentLevel += increment
                if (currentLevel >= targetLevel) {
                  setAnimatedLevels((prev) => {
                    const newLevels = [...prev]
                    newLevels[index] = targetLevel
                    return newLevels
                  })
                } else {
                  setAnimatedLevels((prev) => {
                    const newLevels = [...prev]
                    newLevels[index] = Math.floor(currentLevel)
                    return newLevels
                  })
                  requestAnimationFrame(animateProgress)
                }
              }

              requestAnimationFrame(animateProgress)
            }, index * 200)
          })
        }
      },
      { threshold: 0.3 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  const categories = [...new Set(skills.map((skill) => skill.category))]

  return (
    <Card className="p-6" ref={ref}>
      <h3 className="font-semibold mb-6">Technical Skills</h3>
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">{category}</h4>
            <div className="space-y-4">
              {skills
                .filter((skill) => skill.category === category)
                .map((skill, index) => {
                  const skillIndex = skills.findIndex((s) => s.name === skill.name)
                  return (
                    <div
                      key={skill.name}
                      className={`transition-all duration-500 ${
                        visibleSkills[skillIndex] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-sm text-muted-foreground">{animatedLevels[skillIndex]}%</span>
                      </div>
                      <Progress value={animatedLevels[skillIndex]} className="h-2" />
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
