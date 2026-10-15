export interface Station {
  code: string
  name: string
}

export interface StationOption extends Station {
  searchNames: readonly string[]
}
