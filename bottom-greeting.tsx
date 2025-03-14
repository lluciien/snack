interface BottomGreetingProps {
  name: string
  wish: string
  signedBy: string
  date: string
}

export function BottomGreeting({ name, wish, signedBy, date }: BottomGreetingProps) {
  return (
    <div className="mt-12 mb-8 mx-auto max-w-4xl p-8 bg-[#FFFDD0] rounded-lg shadow-md relative">
      {/* Corner leaf decorations */}
      <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 text-2xl">🍃</div>
      <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 text-2xl rotate-90">🍃</div>
      <div className="absolute bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2 text-2xl -rotate-90">🍃</div>
      <div className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 text-2xl rotate-180">🍃</div>

      <h2 className="text-2xl font-bold text-center text-[#2E8B57] mb-6">送给{name}的生日祝福</h2>

      <div className="text-center text-lg leading-relaxed mb-8">{wish}</div>

      <div className="flex justify-end items-center gap-4">
        <div className="text-right">
          <div className="font-bold text-[#556B2F]">{signedBy}</div>
          <div className="text-sm text-gray-600">{date}</div>
        </div>
        <div className="text-2xl">🎂</div>
      </div>
    </div>
  )
}

