export function getStartAndEndDate(dateString: string) {
  const inputDate = new Date(dateString)

  const year = inputDate.getUTCFullYear()
  const month = inputDate.getUTCMonth()

  const startDate = new Date(Date.UTC(year, month, 1))

  const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))

  return { startDate, endDate }
}
