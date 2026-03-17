import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

export function useCountdown(unlockDate) {
  const getTimeLeft = () => {
    const now = dayjs()
    const target = dayjs(unlockDate)
    const diff = target.diff(now)
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isUnlocked: true }
    const d = dayjs.duration(diff)
    return {
      days: Math.floor(d.asDays()),
      hours: d.hours(),
      minutes: d.minutes(),
      seconds: d.seconds(),
      isUnlocked: false,
    }
  }

  const [timeLeft, setTimeLeft] = useState(getTimeLeft)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft())
    }, 1000)
    return () => clearInterval(interval)
  }, [unlockDate])

  return timeLeft
}