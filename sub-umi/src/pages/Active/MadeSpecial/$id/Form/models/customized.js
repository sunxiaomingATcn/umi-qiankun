export default {
    namespace: 'customized',
    state: {

        code_hasChilds: [5, 1],//有孩子
        code_singleFamily: [0, 1],//无配偶

        code_area_name: ["110000", "110000"],//默认北京
        code_family_composition: null,
        mobile: "",
        name: "",
        gender: "",
        familyComposition: "",
        childCount: "",
        firstGender: "",
        secondGender: "",
        thirdGender: "",
        birthday: "",
        spouseBirthday: "",
        firstBirthday: "",
        secondBirthday: "",
        thirdBirthday: "",
        income: '10万元以下',
        socialInsurance: "",
        areaName: "",
        communicationDate:"",
        communicationTimeRange: "",
    },
    effects: {
        * contact({payload}, {_, put}) {
            console.log("contact", payload)
            yield put({
                type: "saveFormdata",
                payload: {
                    name: "mobile",
                    data: payload.mobile
                }
            })
            return yield put({
                type: "saveFormdata",
                payload: {
                    name: "name",
                    data: payload.name
                }
            })
        },
        * gender({payload}, {_, put}) {
            yield put({
                type: "saveFormdata",
                payload: {
                    name: "gender",
                    data: payload
                }
            })
        },
        * familyComposition({payload}, {_, put}) {

            yield put({
                type: "saveFormdata",
                payload: {
                    name: "code_family_composition",
                    data: payload.familyComposition
                }
            })
            const gender = payload.gender;
            let familyComposition = null;
            switch (payload.familyComposition) {
                case 0:
                    familyComposition = "单身"
                    break;
                case 1:
                    familyComposition = gender == 0 ? "单亲爸爸" : "单亲妈妈"
                    break;
                case 4:
                    familyComposition = "已婚无娃"
                    break;
                case 5:
                    familyComposition = "已婚有娃"
            }
            yield put({
                type: "saveFormdata",
                payload: {
                    name: "familyComposition",
                    data: familyComposition
                }
            })
        },
        * childGender({payload}, {_, put}) {
            yield put({
                type: "saveFormdata",
                payload: {
                    name: payload.first.name,
                    data: payload.first.value
                }
            })
            yield put({
                type: "saveFormdata",
                payload: {
                    name: payload.second.name,
                    data: payload.second.value
                }
            })
            yield put({
                type: "saveFormdata",
                payload: {
                    name: payload.third.name,
                    data: payload.third.value
                }
            })
        },
        * familyBirth({payload}, {_, put}) {
            yield put({
                type: "saveFormdArray",
                payload: payload
            })
        },
        * income({payload}, {_, put}) {
            yield put({
                type: "saveFormdata",
                payload: {
                    name: 'income',
                    data: payload
                }
            })
        },
        * socialInsurance({payload}, {_, put}) {
            yield put({
                type: "saveFormdata",
                payload: {
                    name: 'socialInsurance',
                    data: payload
                }
            })
        },
        * areaName({payload}, {_, put}) {
            // console.log(payload)
            yield put({
                type: "saveFormdata",
                payload: {
                    name: "areaName",
                    data: payload.text
                }
            })
            yield put({
                type: "saveFormdata",
                payload: {
                    name: "code_area_name",
                    data: payload.code
                }
            })
        },
        * childCount({payload}, {_, put}) {
            yield put({
                type: "saveFormdata",
                payload: {
                    name: "childCount",
                    data: payload
                }
            })
        },
        * communicationDate({payload}, {_, put}) {
            yield put({
                type: "saveFormdata",
                payload: {
                    name: "communicationDate",
                    data: payload
                }
            })
        },
        * communicationTimeRange({payload}, {_, put}) {
            yield put({
                type: "saveFormdata",
                payload: {
                    name: "communicationTimeRange",
                    data: payload
                }
            })
        },

    },
    reducers: {
        saveFormdata(state, action) {
            const target = action.payload.name;
            if (!target) return;
            return {
                ...state,
                [target]: action.payload.data
            };
        },
        saveFormdArray(state, action) {
            const targetObj = {};
            action.payload.forEach(item => targetObj[item.name] = item.data)
            return {
                ...state,
                ...targetObj
            };
        },
    },
};
