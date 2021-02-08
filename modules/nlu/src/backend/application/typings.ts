import { IO, NLU } from 'botpress/sdk'

export interface BotDefinition {
  botId: string
  defaultLanguage: string
  languages: string[]
  seed: number
}

export type ProgressCallback = (progress: number) => Promise<void>
export type NeedsTrainingCallback = (language: string) => Promise<void>
export type DirtyModelCallback = (modelId: NLU.ModelId) => Promise<void>

export interface Trainer {
  train(language: string, progressCallback: ProgressCallback): Promise<NLU.ModelId>
  load(modelId: NLU.ModelId): Promise<void>
  cancelTraining(language: string): Promise<void>
}

export interface Predictor {
  predict(text: string, anticipatedLanguage?: string): Promise<EventUnderstanding>
}

export interface Bot extends Trainer, Predictor {
  mount(listener: NeedsTrainingCallback): Promise<void>
  unmount(): Promise<void>
}

export type EventUnderstanding = Omit<IO.EventUnderstanding, 'includedContexts' | 'detectedLanguage'> & {
  detectedLanguage?: string
}

export interface TrainingId {
  botId: string
  language: string
}

export interface TrainingQueue {
  initialize(): Promise<void>
  teardown(): Promise<void>

  needsTraining(trainId: TrainingId): Promise<void>
  queueTraining(trainId: TrainingId, trainer: Trainer): Promise<void>
  cancelTraining(trainId: TrainingId): Promise<void>
  getTraining(trainId: TrainingId): Promise<NLU.TrainingSession>
}

export interface BotFactory {
  initialize(): Promise<void>
  teardown(): Promise<void>
  makeBot(botId: string): Promise<Bot>
}
