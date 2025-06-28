import 'dayjs/locale/pt-br'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.locale('pt-br') // Set locale to Brazilian Portuguese

dayjs.extend(relativeTime)
export const dayjsApi = dayjs
