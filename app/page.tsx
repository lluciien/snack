"use client"

import { useState, useEffect } from "react"
import { SnakeGame } from "../snake-game"
import { Timeline } from "../timeline"
import { ProfileCard } from "../profile-card"
import { BottomGreeting } from "../bottom-greeting"
import { Cake, Gift, BombIcon as Balloon } from "lucide-react"

export default function BirthdayGift() {
  const [score, setScore] = useState(0)
  const [unlockedContent, setUnlockedContent] = useState<string[]>([])
  const [showSpecialAnimation, setShowSpecialAnimation] = useState(false)

  // Character information - replace with actual data
  const character = {
    name: "小明",
    fullName: "王小明",
    birthDate: "1995年5月15日",
    age: 29,
    zodiac: "金牛座",
    personality: ["活泼", "善良", "有创意", "幽默", "细心"],
    interests: ["编程", "阅读", "旅行", "摄影"],
    motto: "生活不止眼前的苟且，还有诗和远方",
    timeline: [
      { year: 2010, event: "获得学校编程比赛一等奖" },
      { year: 2014, event: "考入理想大学计算机系" },
      { year: 2018, event: "毕业后加入知名科技公司" },
      { year: 2022, event: "晋升为技术团队负责人" },
    ],
    funFacts: [
      "他曾经一口气写了24小时代码不休息",
      "他的第一个程序是8岁时用BASIC语言写的",
      "他最喜欢的食物是妈妈做的红烧肉",
      "他养了一只叫「二进制」的猫",
      "他梦想环游世界的每个角落",
      "他收藏了超过50个不同形状的马克杯",
    ],
    unlockableContent: [
      "50分：小明的第一台电脑是8岁时父母送的生日礼物",
      "100分：小明有一个秘密梦想是开发一款能帮助孩子学习编程的游戏",
    ],
    birthdayWish:
      "祝你生日快乐！愿你在新的一年里代码无bug，创意无限，像贪吃蛇一样不断成长，吞噬更多的知识与经验。希望你的人生旅途充满惊喜与成就，就像游戏中不断刷新的高分一样！",
    signedBy: "你最好的朋友",
    date: "2024年5月15日",
  }

  // Check for unlockable content when score changes
  useEffect(() => {
    if (score >= 50 && !unlockedContent.includes(character.unlockableContent[0])) {
      setUnlockedContent((prev) => [...prev, character.unlockableContent[0]])
      setShowSpecialAnimation(true)
    }
    if (score >= 100 && !unlockedContent.includes(character.unlockableContent[1])) {
      setUnlockedContent((prev) => [...prev, character.unlockableContent[1]])
      setShowSpecialAnimation(true)
    }

    if (showSpecialAnimation) {
      const timer = setTimeout(() => {
        setShowSpecialAnimation(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [score, unlockedContent, character.unlockableContent, showSpecialAnimation])

  // Check if today is the birthday
  useEffect(() => {
    const today = new Date()
    const birthMonth = 5 // May
    const birthDay = 15

    if (today.getMonth() + 1 === birthMonth && today.getDate() === birthDay) {
      // Trigger birthday animation
      setShowSpecialAnimation(true)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F5DC] relative overflow-hidden">
      {/* Falling leaves animation */}
      <div className="falling-leaves"></div>

      {/* Header section */}
      <header className="h-[180px] bg-gradient-to-r from-[#2E8B57] to-[#98FB98] flex items-center justify-between px-8 relative">
        <div className="text-[#FFD700]">
          <Cake size={48} />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-serif text-[#FFFDD0] mb-2">{character.name}的绿色世界</h1>
          <h2 className="text-xl text-[#FFFDD0]">
            送给{character.name}的第{character.age}个生日礼物
          </h2>
        </div>
        <div className="text-[#FFD700] flex">
          <Balloon size={36} className="mr-2" />
          <div className="text-3xl font-bold">{character.age}</div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-wrap p-6">
        {/* Left profile section */}
        <div className="w-full lg:w-2/5 p-4">
          <ProfileCard character={character} />
          <div className="mt-8 bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-2xl font-bold text-[#2E8B57] mb-4">生活时间轴</h3>
            <Timeline events={character.timeline} />
          </div>
        </div>

        {/* Right game section */}
        <div className="w-full lg:w-3/5 p-4">
          <div className="bg-[#556B2F] p-4 rounded-lg">
            <h3 className="text-2xl font-bold text-[#FFFDD0] mb-4 text-center">贪吃蛇游戏</h3>
            <SnakeGame
              onScoreChange={(newScore) => {
                // Use setTimeout to avoid state updates during render
                setTimeout(() => {
                  setScore(newScore)
                }, 0)
              }}
              currentScore={score}
              funFacts={character.funFacts}
            />

            {/* Unlockable content */}
            <div className="mt-6 bg-[#FFFDD0] rounded-lg p-4">
              <h4 className="text-xl font-bold text-[#2E8B57] mb-2">解锁内容</h4>
              <ul className="space-y-2">
                {character.unlockableContent.map((content, index) => {
                  const scoreThresholds = [50, 100]
                  return (
                    <li key={index} className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center ${unlockedContent.includes(content) ? "bg-[#2E8B57] text-white" : "bg-gray-200"}`}
                      >
                        {unlockedContent.includes(content) ? "✓" : "?"}
                      </div>
                      <span className={unlockedContent.includes(content) ? "text-[#2E8B57]" : "text-gray-500"}>
                        {scoreThresholds[index]}分解锁：
                        {unlockedContent.includes(content) ? content.split("：")[1] : "达到分数后解锁"}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom greeting section */}
      <BottomGreeting
        name={character.name}
        wish={character.birthdayWish}
        signedBy={character.signedBy}
        date={character.date}
      />

      {/* Special animation overlay */}
      {showSpecialAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="text-center p-8 bg-[#FFFDD0] rounded-lg max-w-2xl animate-bounce-in">
            <h2 className="text-3xl font-bold text-[#FF69B4] mb-4">🎉 恭喜解锁新内容！ 🎉</h2>
            {unlockedContent.length > 0 && (
              <p className="text-xl text-[#2E8B57]">{unlockedContent[unlockedContent.length - 1]}</p>
            )}
            <div className="mt-6 flex justify-center space-x-4">
              <Gift size={48} className="text-[#FFD700] animate-pulse" />
              <Balloon size={48} className="text-[#FF69B4] animate-bounce" />
              <Cake size={48} className="text-[#2E8B57] animate-pulse" />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .falling-leaves {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

