/**
 * Retorna a data formatada
 * @param {Date} date 
 * @param {String} format 
 * @returns {String} Data formatada
 */
export function formatDate(date: Date, format: string) {
    if (!(date instanceof Date)) {
        throw new Error('date_utils.js > formatDate: date must be a Date instance');
    }
    if (isNaN(date.getTime())) {
        throw new Error('date_utils.js > formatDate: Invalid date');
    }
    if (!format) {
        throw new Error('date_utils.js > formatDate: format must be provided');
    }

    const components = {
        dd: ('0' + date.getDate()).slice(-2),
        MM: ('0' + (date.getMonth() + 1)).slice(-2),
        yyyy: date.getFullYear(),
        HH: ('0' + date.getHours()).slice(-2),
        mm: ('0' + date.getMinutes()).slice(-2),
        ss: ('0' + date.getSeconds()).slice(-2)
    };

    const rtn = format.replace(/dd|MM|yyyy|HH|mm|ss/g, match => components[match] || match);

    return rtn;
}

export function getMesAbreviado(mes: Date): string {
    const monthAbbr = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Maio', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    return monthAbbr[mes.getMonth()]; // getMonth() retorna de 0 (Janeiro) a 11 (Dezembro)
}

export function getMesNumero(mes: Date): string {
    const numeroMes = (mes.getMonth() + 1).toString().padStart(2, '0');
    return numeroMes;
}


export default {
    formatDate,
    getMesAbreviado,
    getMesNumero
}