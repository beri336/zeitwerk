// src/composables/useHolidays.js

// All public holidays in Germany — all 16 federal states
// Calculation based on Easter Sunday (Gauss's formula)

export const STATES = {
    BW: 'Baden-Württemberg',
    BY: 'Bayern',
    BE: 'Berlin',
    BB: 'Brandenburg',
    HB: 'Bremen',
    HH: 'Hamburg',
    HE: 'Hessen',
    MV: 'Mecklenburg-Vorpommern',
    NI: 'Niedersachsen',
    NW: 'Nordrhein-Westfalen',
    RP: 'Rheinland-Pfalz',
    SL: 'Saarland',
    SN: 'Sachsen',
    ST: 'Sachsen-Anhalt',
    SH: 'Schleswig-Holstein',
    TH: 'Thüringen'
}

// Gauss's Easter Formula
function easterSunday(year) {
    const a = year % 19
    const b = Math.floor(year / 100)
    const c = year % 100
    const d = Math.floor(b / 4)
    const e = b % 4
    const f = Math.floor((b + 8) / 25)
    const g = Math.floor((b - f + 1) / 3)
    const h = (19 * a + b - d - g + 15) % 30
    const i = Math.floor(c / 4)
    const k = c % 4
    const l = (32 + 2 * e + 2 * i - h - k) % 7
    const m = Math.floor((a + 11 * h + 22 * l) / 451)
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1 // 0-indexed
    const day = ((h + l - 7 * m + 114) % 31) + 1

    return new Date(year, month, day)
}

function addDays(date, days) {
    const d = new Date(date)
    d.setDate(d.getDate() + days)

    return d
}

function format(date) {
    const p = num => String(num).padStart(2, '0')

    return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
}

// Returns all holidays for a given year and state
// { date: ‘YYYY-MM-DD’, name: string, nationwide: boolean }
export function getHolidays(year, state) {
    const os = easterSunday(year) // Easter Sunday

    // Movable holidays relative to Easter
    const karfreitag = format(addDays(os, -2))
    const ostersonntag = format(os)
    const ostermontag = format(addDays(os, 1))
    const christiHimmelfahrt = format(addDays(os, 39))
    const pfingstsonntag = format(addDays(os, 49))
    const pfingstmontag = format(addDays(os, 50))
    const fronleichnam = format(addDays(os, 60))

    // Public Holidays
    const neujahr = `${year}-01-01`
    const heiligeDreiKoenige = `${year}-01-06`
    const frauentag = `${year}-03-08`
    const tag_der_arbeit = `${year}-05-01`
    const augsburgerFrieden = `${year}-08-08`
    const mariaHimmelfahrt = `${year}-08-15`
    const weltkindertag = `${year}-09-20`
    const tag_der_deutschen = `${year}-10-03`
    const reformationstag = `${year}-10-31`
    const allerheiligen = `${year}-11-01`
    const bussUndBettag = getBussUndBettag(year)
    const heiligabend_halb = `${year}-12-24` // Not required by law, but often is
    const weihnacht1 = `${year}-12-25`
    const weihnacht2 = `${year}-12-26`

    // National Holidays
    const base = [
        { date: neujahr, name: 'Neujahr' },
        { date: karfreitag, name: 'Karfreitag' },
        { date: ostersonntag, name: 'Ostersonntag' },
        { date: ostermontag, name: 'Ostermontag' },
        { date: tag_der_arbeit, name: 'Tag der Arbeit' },
        { date: christiHimmelfahrt, name: 'Christi Himmelfahrt' },
        { date: pfingstsonntag, name: 'Pfingstsonntag' },
        { date: pfingstmontag, name: 'Pfingstmontag' },
        { date: tag_der_deutschen, name: 'Tag der Deutschen Einheit' },
        { date: weihnacht1, name: '1. Weihnachtstag' },
        { date: weihnacht2, name: '2. Weihnachtstag' },
    ]

    // State-specific additions
    const extra = []

    const has = (...codes) => codes.includes(state)

    // Heilige Drei Könige: BW, BY, ST
    if (has('BW', 'BY', 'ST'))
        extra.push({ date: heiligeDreiKoenige, name: 'Heilige Drei Könige' })

    // Frauentag: BE, MV (since 2019), TH (since 2020)
    if (has('BE', 'MV', 'TH'))
        extra.push({ date: frauentag, name: 'Internationaler Frauentag' })

    // Fronleichnam: BW, BY, HE, NW, RP, SL + in part SN, TH
    if (has('BW', 'BY', 'HE', 'NW', 'RP', 'SL', 'SN', 'TH'))
        extra.push({ date: fronleichnam, name: 'Fronleichnam' })

    // Augsburger Hohes Friedensfest: only BY (City of Augsburg) — show it anyway
    if (has('BY'))
        extra.push({ date: augsburgerFrieden, name: 'Augsburger Hohes Friedensfest' })

    // Mariä Himmelfahrt: BY (kath. Gemeinden), SL
    if (has('BY', 'SL'))
        extra.push({ date: mariaHimmelfahrt, name: 'Mariä Himmelfahrt' })

    // Weltkindertag: TH
    if (has('TH'))
        extra.push({ date: weltkindertag, name: 'Weltkindertag' })

    // Reformationstag: BB, HB, HH, MV, NI, SN, ST, SH, TH
    if (has('BB', 'HB', 'HH', 'MV', 'NI', 'SN', 'ST', 'SH', 'TH'))
        extra.push({ date: reformationstag, name: 'Reformationstag' })

    // Allerheiligen: BW, BY, NW, RP, SL
    if (has('BW', 'BY', 'NW', 'RP', 'SL'))
        extra.push({ date: allerheiligen, name: 'Allerheiligen' })

    // Buß- und Bettag: SN
    if (has('SN'))
        extra.push({ date: bussUndBettag, name: 'Buß- und Bettag' })

    return [...base, ...extra].sort((dateA, dateB) => dateA.date.localeCompare(dateB.date))
}

// Buß- und Bettag = The Wednesday before November 23
function getBussUndBettag(year) {
    const nov23 = new Date(year, 10, 23)
    const dow = nov23.getDay() // 0=So
    // Tage zurück bis Mittwoch (3)
    const diff = (dow >= 3) ? dow - 3 : dow + 4
    return format(new Date(year, 10, 23 - diff))
}

// Filters holidays for a specific month
export function getHolidaysForMonth(year, month, state) {
    return getHolidays(year, state).filter(h => {
        const d = new Date(h.date)
        
        return d.getFullYear() === year && d.getMonth() === month
    })
}
