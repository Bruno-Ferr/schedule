import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { CaretLeft, CaretRight } from 'phosphor-react'
import { useMemo, useState } from 'react'
import { api } from '../../lib/axios'
import { getWeekDays } from '../../utils/get-week-days'
import {
  CalendarActions,
  CalendarBody,
  CalendarContainer,
  CalendarDay,
  CalendarHeader,
  CalendarTitle,
} from './styles'

interface CalendarWeek {
  week: number
  days: Array<{
    date: dayjs.Dayjs
    disabled: boolean
  }>
}

type CalendarWeeks = CalendarWeek[]

interface BlockedDates {
  blockedWeekDays: number[]
  blockedDates: number[]
}

interface CalendarProps {
  selectedDate: Date | null
  onDateSelected: (date: Date) => void
}

export function Calendar({ selectedDate, onDateSelected }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    return dayjs().set('date', 1)
  })

  const router = useRouter()

  function handlePreviousMonth() {
    const previousMonth = currentDate.subtract(1, 'month')

    setCurrentDate(previousMonth)
  }

  function handleNextMonth() {
    const nextMonth = currentDate.add(1, 'month')

    setCurrentDate(nextMonth)
  }

  const shortWeekDays = getWeekDays({ short: true })

  const currentMonth = currentDate.format('MMMM')
  const currentYear = currentDate.format('YYYY')

  const username = String(router.query.username)

  const { data: blockedDates } = useQuery<BlockedDates>(
    ['blocked-dates', currentDate.get('year'), currentDate.get('month')], // faz o cache
    async () => {
      const response = await api.get(`/users/${username}/blocked-dates`, {
        params: {
          year: currentDate.get('year'),
          month: currentDate.get('month') + 1,
        },
      })

      return response.data
    },
  )
  
  console.log('calendarWeeks ~ blockedDates', blockedDates)

  //Como tem bastante calculo não é interessante realizar tudo sempre quando o componente renderizar
  //Pra isso utiliza o useMemo
  const calendarWeeks = useMemo(() => { 
    if (!blockedDates) {
      return []
    }

    //Verificar quantos dias existe em um mês
    const daysInMonthArray = Array.from({
      length: currentDate.daysInMonth(), //Retorna exatamente a quantidade de dias do mês atual
    }).map((_, i) => { //Pega o índice 
      return currentDate.set('date', i + 1) //Retorna o dia, (i começa em 0 então i + 1) (date = dia)
    })

    const firstWeekDay = currentDate.get('day') //Pega o número do dia da semana (day = dia da semana) (quarta = 3)

    //Criar um array com os dias do mês passado pra preencher o mapa
    const previousMonthFillArray = Array.from({
      length: firstWeekDay,
    }).map((_, i) => {
      return currentDate.subtract(i + 1, 'day') // Pega a data subtraindo
    }).reverse() //Inverte a ordem do array

    const lastDayInCurrentMonth = currentDate.set(
      'date',
      currentDate.daysInMonth(),
    ) // Retorna o data no total de dias do mês, logo o ultimo dia do mês
    const lastWeekDay = lastDayInCurrentMonth.get('day') //Pega o número do dia da semana (sábado = 6)

    const nextMonthFillArray = Array.from({
      length: 7 - (lastWeekDay + 1), //7 dias - O ultimo dia do mês (+1 pq zero o primeiro é 0)
    }).map((_, i) => {
      return lastDayInCurrentMonth.add(i + 1, 'day')
    })
  
    const calendarDays = [
      ...previousMonthFillArray.map((date) => {
        return { date, disabled: true }
      }),
      ...daysInMonthArray.map((date) => {
        //Desabilita os dias que já passaram do mês atual
        return {
          date,
          disabled: // Desabilita se o dia já passou e se não for um dia de opção ("bloqueado") do usuário
            date.endOf('day').isBefore(new Date()) || //endOf retorna o dia no ultimo horário
            blockedDates.blockedWeekDays.includes(date.get('day')) ||
            blockedDates.blockedDates.includes(date.get('date')),
        }
      }),
      ...nextMonthFillArray.map((date) => {
        return { date, disabled: true }
      }),
    ] //Coloca tudo em um array só

    const calendarWeeks = calendarDays.reduce<CalendarWeeks>(
      (weeks, _, i, original) => { //(_ = é cada um dos dias, não será utilizado, i = indice, original = calendarDaysOriginal)
        const isNewWeek = i % 7 === 0 //Verifica se a semana terminou

        if (isNewWeek) {
          weeks.push({
            week: i / 7 + 1, //Para começar com 1 semana
            days: original.slice(i, i + 7), //Separa em semanas
          })
        }

        return weeks
      },
      [], // weeks
    )

    return calendarWeeks
  }, [currentDate, blockedDates])

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>
          {currentMonth} <span>{currentYear}</span>
        </CalendarTitle>

        <CalendarActions>
          <button onClick={handlePreviousMonth} title="Previous month">
            <CaretLeft />
          </button>
          <button onClick={handleNextMonth} title="Next month">
            <CaretRight />
          </button>
        </CalendarActions>
      </CalendarHeader>

      <CalendarBody>
        <thead>
          <tr>
            {shortWeekDays.map((weekDay) => (
              <th key={weekDay}>{weekDay}.</th>
            ))}
          </tr>
        </thead>
        <tbody>
        {calendarWeeks.map(({ week, days }) => {
            return (
              <tr key={week}>
                {days.map(({ date, disabled }) => {
                  return (
                    <td key={date.toString()}>
                      <CalendarDay
                        onClick={() => onDateSelected(date.toDate())}
                        disabled={disabled}
                      >
                        {date.get('date')}
                      </CalendarDay>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </CalendarBody>
    </CalendarContainer>
  )
}