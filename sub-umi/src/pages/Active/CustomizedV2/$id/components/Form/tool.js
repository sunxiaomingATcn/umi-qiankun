
export default {
    getDateString : function(date){
        if (!date) return;
        const h = date.getFullYear();
        const m = date.getMonth() < 9 ? '0' + (date.getMonth() + 1 ): date.getMonth() + 1 ;
        const d = date.getDate() < 10 ? '0' + date.getDate():date.getDate();
        return `${h}-${m}-${d}`;
    }
}

