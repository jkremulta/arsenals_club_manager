export interface GamesBySkill {
  beginner: number;
  intermediate: number;
  advanced: number;
}

export interface Training {
  id: string
  startTime: string
  isActive: boolean
  games_today: number
  games_by_skill: GamesBySkill
  attendance: string[]
  current_players: string[]
  initialized_players: string[]
  initializedSkillGroup?: string
  currentGameSkillGroup?: string
  initializedTeam?: string | null
  currentGameTeam?: string | null
}