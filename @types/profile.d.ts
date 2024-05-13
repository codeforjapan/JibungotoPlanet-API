declare namespace Profile {
  interface Profile {
    id: string
    baselines: EmissionItem[]
    estimations: EmissionItem[]
    createdAt: Date
    updatedAt: Date
    mobilityAnswer?: any
    housingAnswer?: any
    foodAnswer?: any
    otherAnswer?: any
  }

  interface EmissionItem {
    domain: QuestionCategory
    item: string
    subdomain: string
    type: 'amount' | 'intensity'
    unit: string
    value: number
  }

  interface EmissionResult {
    key: string;
    value: number;
  }

  type QuestionCategory = 'food' | 'mobility' | 'housing' | 'other'
}
