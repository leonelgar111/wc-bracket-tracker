import type { PlayerBracket } from './types';

export const REALISTIC: Record<string, PlayerBracket> = {
  Leonel: {
    name: 'Leonel',
    R32: ['PAR','FRA','CAN','NED','POR','ESP','USA','BEL','BRA','NOR','MEX','ENG','ARG','EGY','SUI','COL'],
    R16: ['FRA','NED','ESP','USA','BRA','MEX','ARG','COL'],
    QF:  ['FRA','ESP','MEX','ARG'],
    SF:  ['FRA','MEX'],
    Champion: 'MEX',
  },
  Adan: {
    name: 'Adan',
    R32: ['GER','FRA','CAN','NED','POR','ESP','USA','SEN','BRA','CIV','MEX','ENG','ARG','AUS','SUI','COL'],
    R16: ['FRA','NED','ESP','SEN','BRA','MEX','ARG','COL'],
    QF:  ['NED','ESP','BRA','ARG'],
    SF:  ['NED','BRA'],
    Champion: 'NED',
  },
  Abe: {
    name: 'Abe',
    R32: ['GER','FRA','CAN','NED','POR','ESP','USA','BEL','BRA','NOR','MEX','ENG','ARG','EGY','ALG','COL'],
    R16: ['FRA','NED','POR','BEL','BRA','MEX','ARG','COL'],
    QF:  ['FRA','POR','BRA','COL'],
    SF:  ['FRA','BRA'],
    Champion: 'FRA',
  },
  Joey: {
    name: 'Joey',
    R32: ['GER','FRA','CAN','NED','POR','ESP','USA','SEN','BRA','NOR','MEX','ENG','ARG','EGY','SUI','COL'],
    R16: ['FRA','NED','POR','SEN','BRA','MEX','ARG','COL'],
    QF:  ['FRA','POR','MEX','ARG'],
    SF:  ['FRA','ARG'],
    Champion: 'FRA',
  },
  Carlos: {
    name: 'Carlos',
    R32: ['GER','FRA','CAN','NED','POR','ESP','USA','BEL','BRA','NOR','MEX','ENG','ARG','EGY','SUI','COL'],
    R16: ['FRA','NED','ESP','BEL','BRA','MEX','ARG','COL'],
    QF:  ['FRA','ESP','MEX','ARG'],
    SF:  ['FRA','ARG'],
    Champion: 'FRA',
  },
};

export const FUN: Record<string, PlayerBracket> = {
  Leonel: {
    name: 'Leonel',
    R32: ['PAR','FRA','CAN','MAR','POR','ESP','USA','SEN','BRA','CIV','MEX','ENG','ARG','EGY','SUI','COL'],
    R16: ['FRA','MAR','ESP','USA','BRA','MEX','ARG','COL'],
    QF:  ['FRA','ESP','MEX','COL'],
    SF:  ['FRA','MEX'],
    Champion: 'MEX',
  },
  Adan: {
    name: 'Adan',
    R32: ['GER','FRA','CAN','NED','POR','ESP','BIH','SEN','BRA','CIV','MEX','COD','CPV','EGY','SUI','COL'],
    R16: ['FRA','NED','POR','SEN','BRA','MEX','CPV','COL'],
    QF:  ['FRA','POR','MEX','COL'],
    SF:  ['POR','MEX'],
    Champion: 'MEX',
  },
  Abe: {
    name: 'Abe',
    R32: ['GER','FRA','CAN','MAR','POR','ESP','USA','BEL','BRA','CIV','MEX','ENG','ARG','EGY','ALG','COL'],
    R16: ['FRA','MAR','ESP','BEL','BRA','MEX','ARG','COL'],
    QF:  ['FRA','ESP','MEX','COL'],
    SF:  ['FRA','MEX'],
    Champion: 'MEX',
  },
  Joey: {
    name: 'Joey',
    R32: ['GER','FRA','CAN','NED','POR','ESP','BIH','SEN','BRA','CIV','MEX','ENG','ARG','EGY','SUI','COL'],
    R16: ['FRA','NED','POR','SEN','BRA','MEX','ARG','COL'],
    QF:  ['FRA','POR','MEX','COL'],
    SF:  ['POR','MEX'],
    Champion: 'MEX',
  },
  Carlos: {
    name: 'Carlos',
    R32: ['GER','FRA','CAN','NED','POR','ESP','USA','BEL','JPN','NOR','MEX','ENG','ARG','EGY','ALG','COL'],
    R16: ['GER','NED','POR','USA','JPN','MEX','EGY','COL'],
    QF:  ['NED','POR','MEX','COL'],
    SF:  ['POR','MEX'],
    Champion: 'MEX',
  },
};

export const PLAYERS = ['Leonel', 'Adan', 'Abe', 'Joey', 'Carlos'] as const;
