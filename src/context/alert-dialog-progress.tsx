import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@promo/components/ui/alert-dialog'
import { Progress } from '@promo/components/ui/progress'
import {
  StatefulButton,
  type StatefulButtonMethods,
} from '@promo/components/ui/stateful-button'
import {
  type Dispatch,
  type ReactNode,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import { createContext, useContextSelector } from 'use-context-selector'

export type AlertDialogProgressPayload = {
  title: string
  description?: string
  progress: number
  buttonText: string
  success?: boolean
  error?: boolean
}

type AlertDialogState = {
  open: boolean
} & Partial<AlertDialogProgressPayload>

enum AlertDialogActionType {
  SHOW_ALERT = 'SHOW_ALERT',
  HIDE_ALERT = 'HIDE_ALERT',
  UPDATE_PROGRESS = 'UPDATE_PROGRESS',
  CHANGE_BUTTON_TEXT = 'CHANGE_BUTTON_TEXT',
  STOP_SUCCESS = 'STOP_SUCCESS',
  STOP_ERROR = 'STOP_ERROR',
}

type Action =
  | {
      type: AlertDialogActionType.SHOW_ALERT
      payload: AlertDialogProgressPayload
    }
  | { type: AlertDialogActionType.HIDE_ALERT }
  | {
      type: AlertDialogActionType.UPDATE_PROGRESS
      payload: { progress: number }
    }
  | {
      type: AlertDialogActionType.CHANGE_BUTTON_TEXT
      payload: { text: string }
    }
  | {
      type: AlertDialogActionType.STOP_SUCCESS
    }
  | {
      type: AlertDialogActionType.STOP_ERROR
    }

function reducer(state: AlertDialogState, action: Action): AlertDialogState {
  switch (action.type) {
    case AlertDialogActionType.SHOW_ALERT:
      return { open: true, success: false, error: false, ...action.payload }
    case AlertDialogActionType.HIDE_ALERT:
      return { ...state, open: false }
    case AlertDialogActionType.UPDATE_PROGRESS:
      return { ...state, progress: action.payload.progress }
    case AlertDialogActionType.CHANGE_BUTTON_TEXT:
      return { ...state, buttonText: action.payload.text }
    case AlertDialogActionType.STOP_SUCCESS:
      return { ...state, success: true }
    case AlertDialogActionType.STOP_ERROR:
      return { ...state, error: true }
    default:
      return state
  }
}

type AlertDialogContext = {
  state: AlertDialogState
  dispatch: Dispatch<Action>
}

const AlertDialogProgressContext = createContext<AlertDialogContext>({
  state: { open: false, buttonText: 'Uploading...' },
  dispatch: () => {},
})

type AlertDialogContextProviderProps = {
  children: ReactNode
}

export function AlertDialogProgressContextProvider({
  children,
}: AlertDialogContextProviderProps) {
  const [state, dispatch] = useReducer(reducer, { open: false })
  const [isCompleted, setIsCompleted] = useState(false)

  const {
    title,
    description,
    progress,
    buttonText,
    success = false,
    error = false,
  } = state

  const buttonRef = useRef<StatefulButtonMethods>(null)

  function handleOpenChange(open: boolean) {
    if (!open) {
      dispatch({ type: AlertDialogActionType.HIDE_ALERT })
    }

    setIsCompleted(false)
  }

  useEffect(() => {
    if (success) {
      buttonRef.current?.stopSuccess()
      setIsCompleted(true)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      buttonRef.current?.stopError()
      setIsCompleted(true)
    }
  }, [error])

  return (
    <AlertDialogProgressContext.Provider value={{ state, dispatch }}>
      {children}

      <AlertDialog open={state.open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>

          <Progress value={progress} className="w-full" />

          <AlertDialogFooter>
            <StatefulButton
              ref={buttonRef}
              startsWithLoading
              disableLoadingOnClick
              disabled={!isCompleted}
              onClick={() => {
                dispatch({ type: AlertDialogActionType.HIDE_ALERT })
              }}
            >
              {buttonText}
            </StatefulButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogProgressContext.Provider>
  )
}

export function useAlertDialogProgress() {
  const context = useContextSelector(
    AlertDialogProgressContext,
    (context) => context,
  )
  if (!context) {
    throw new Error(
      'useAlertDialogProgress must be used within an AlertDialogProgressContextProvider',
    )
  }

  return {
    showAlertDialogProgress: (payload: AlertDialogProgressPayload) => {
      context.dispatch({ type: AlertDialogActionType.SHOW_ALERT, payload })
    },
    hideAlertDialogProgress: () => {
      context.dispatch({ type: AlertDialogActionType.HIDE_ALERT })
    },
    updateProgress: (progress: number) => {
      context.dispatch({
        type: AlertDialogActionType.UPDATE_PROGRESS,
        payload: { progress },
      })
    },
    changeButtonText: (text: string) => {
      context.dispatch({
        type: AlertDialogActionType.CHANGE_BUTTON_TEXT,
        payload: { text },
      })
    },
    stopSuccess: () => {
      context.dispatch({ type: AlertDialogActionType.STOP_SUCCESS })
    },
    stopError: () => {
      context.dispatch({ type: AlertDialogActionType.STOP_ERROR })
    },
  }
}
