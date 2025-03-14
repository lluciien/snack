interface TimelineEvent {
  year: number
  event: string
}

interface TimelineProps {
  events: TimelineEvent[]
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#98FB98]"></div>

      {/* Timeline events */}
      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={index} className="relative pl-12">
            {/* Year circle */}
            <div className="absolute left-0 w-8 h-8 bg-[#2E8B57] rounded-full flex items-center justify-center text-white font-bold">
              {event.year}
            </div>

            {/* Event content */}
            <div className="bg-[#F5F5DC] p-3 rounded-lg">
              <p>{event.event}</p>
            </div>

            {/* Leaf decoration */}
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 text-[#2E8B57] rotate-45">🍃</div>
          </div>
        ))}
      </div>
    </div>
  )
}

