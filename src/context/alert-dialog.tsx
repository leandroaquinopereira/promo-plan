import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@promo/components/ui/alert-dialog'
import { type Dispatch, type ReactNode, useReducer } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'

export type AlertDialogPayload = {
  title: string
  description?: string
  actionLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
}

type AlertDialogState = {
  open: boolean
} & Partial<AlertDialogPayload>

enum AlertDialogActionType {
  SHOW_ALERT = 'SHOW_ALERT',
  HIDE_ALERT = 'HIDE_ALERT',
}

type Action =
  | { type: AlertDialogActionType.SHOW_ALERT; payload: AlertDialogPayload }
  | { type: AlertDialogActionType.HIDE_ALERT }

function reducer(state: AlertDialogState, action: Action): AlertDialogState {
  switch (action.type) {
    case AlertDialogActionType.SHOW_ALERT:
      return { open: true, ...action.payload }
    case AlertDialogActionType.HIDE_ALERT:
      return { ...state, open: false }
    default:
      return state
  }
}

type AlertDialogContext = {
  state: AlertDialogState
  dispatch: Dispatch<Action>
}

const AlertDialogContext = createContext<AlertDialogContext>({
  state: { open: false },
  dispatch: () => {},
})

type AlertDialogContextProviderProps = {
  children: ReactNode
}

export function AlertDialogContextProvider({
  children,
}: AlertDialogContextProviderProps) {
  const [state, dispatch] = useReducer(reducer, { open: false })
  const {
    title,
    description,
    actionLabel = 'Ok',
    cancelLabel = 'Fechar',
    onConfirm,
    onCancel,
  } = state

  function handleCancel() {
    onCancel?.()
    dispatch({ type: AlertDialogActionType.HIDE_ALERT })
  }

  function handleConfirm() {
    onConfirm?.()
    dispatch({ type: AlertDialogActionType.HIDE_ALERT })
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      dispatch({ type: AlertDialogActionType.HIDE_ALERT })
    }
  }

  return (
    <AlertDialogContext.Provider value={{ state, dispatch }}>
      {children}

      <AlertDialog open={state.open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {cancelLabel}
            </AlertDialogCancel>

            <AlertDialogAction onClick={handleConfirm}>
              {actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  )
}

export function useAlertDialog() {
  const context = useContextSelector(AlertDialogContext, (context) => context)
  if (!context) {
    throw new Error(
      'useAlertDialog must be used within an AlertDialogContextProvider',
    )
  }

  return {
    showAlertDialog: (payload: AlertDialogPayload) => {
      context.dispatch({ type: AlertDialogActionType.SHOW_ALERT, payload })
    },
    hideAlertDialog: () => {
      context.dispatch({ type: AlertDialogActionType.HIDE_ALERT })
    },
  }
}
