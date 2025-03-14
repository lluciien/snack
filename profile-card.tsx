import Image from "next/image"

interface Character {
  name: string
  fullName: string
  birthDate: string
  age: number
  zodiac: string
  personality: string[]
  interests: string[]
  motto: string
}

interface ProfileCardProps {
  character: Character
}

export function ProfileCard({ character }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-24 bg-gradient-to-r from-[#2E8B57] to-[#98FB98]">
        {/* Hexagon profile picture frame */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 bg-[#556B2F] transform rotate-45 rounded-lg"></div>
            <div className="absolute inset-2 bg-white transform rotate-45 rounded-lg"></div>
            <div className="absolute inset-3 overflow-hidden rounded-full">
              <Image
                src="/placeholder.svg?height=120&width=120"
                alt={character.name}
                width={120}
                height={120}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 p-6">
        <h2 className="text-2xl font-bold text-center text-[#2E8B57] mb-1">{character.fullName}</h2>
        <p className="text-center text-gray-500 mb-6">{character.zodiac}</p>

        <div className="grid gap-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-right font-semibold text-[#556B2F]">生日：</div>
            <div className="col-span-2">{character.birthDate}</div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="text-right font-semibold text-[#556B2F]">年龄：</div>
            <div className="col-span-2">{character.age}岁</div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="text-right font-semibold text-[#556B2F]">性格：</div>
            <div className="col-span-2 flex flex-wrap gap-1">
              {character.personality.map((trait, index) => (
                <span key={index} className="px-2 py-1 bg-[#98FB98] text-[#2E8B57] rounded-full text-xs">
                  {trait}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="text-right font-semibold text-[#556B2F]">兴趣：</div>
            <div className="col-span-2">{character.interests.join("、")}</div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="text-right font-semibold text-[#556B2F]">座右铭：</div>
            <div className="col-span-2 italic">"{character.motto}"</div>
          </div>
        </div>
      </div>
    </div>
  )
}

