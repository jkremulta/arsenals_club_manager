export type Gender = 'male' | 'female'
export type Skill = 'beginner' | 'intermediate' | 'advanced'

export interface Player {
  id: string
  name: string
  birthday: string
  gender: Gender
  skill: Skill
  rank: number
  games_played: number
  paid: boolean
  late: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreatePlayer {
  name: string
  rank: number
  gender: string
  birthday: string
  skill: Skill
}