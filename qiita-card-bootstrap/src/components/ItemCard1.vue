<template>
<div>
    <div id="id_view" v-show="isModeView" @click="clickPanelView">
        {{dateCurrent}} . {{timeCurrent}} . <b-badge v-bind:variant="typeVariant">{{typeStr}}</b-badge><br>
        <b-form-textarea
            id="id_notes"
            v-bind:value="notesCurrent"
            readonly 
            rows="2"
            max-rows="2"
        ></b-form-textarea>
        <!--
            rows : The minimum number of rows to display. Must be a value greater than 1
            https://bootstrap-vue.org/docs/components/form-textarea#comp-ref-b-form-textarea-props
        -->
    </div>
    <div id="id_edit" v-show="isModeEdit">
        <input v-model="dateCurrent" type="date"> . <input v-model="timeCurrent" type="time"> . <input v-model="typeStr"> ※ラジオボタンで選択したい。
        <button @click="clickBtnEditFinish">確定</button><br>
        <br>
        <b-form-textarea
            id="id_notes"
            v-model="notesCurrent"
            placeholder="Enter something..."
            rows="2"
            max-rows="16"
        ></b-form-textarea>
    </div>
</div>
</template>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* Cssファイルはここへ配置する。 */

</style>


<script>
// javascriptファイルをココへ。
import moment from 'moment'
import { BBadge, BFormTextarea } from 'bootstrap-vue'


export default {
    name : "ItemCard",
    components : {
        BFormTextarea,
        BBadge
    },
    props : {
        typelist : {
            type : Array,
            required: true
        },
        datetime : {
            type: String,
            required: true
        },
        type : {
            type: Number,
            required: true
        },
        notes: {
            type: String,
            required: false
        }
    },
    data : function () {
        return {
            notesCurrent : '',
            typeOptions : [],
            typeCurrent : '',
            timeCurrent: '',
            dateCurrent: '',
            isModeView: true,
            isModeEdit: false
        }
    },
    watch : {
        datetime : {
            immediate: true,
            handler: function (newdateCurrenting) {
                const date0 = new Date();
                date0.setTime(newdateCurrenting + "000");
                const date = moment(date0);
                this.dateCurrent = date.format("YYYY-MM-DD");
                this.timeCurrent = date.format("HH:MM:00");
            }
        },
        type : {
            immediate: true,
            handler: function (newTypeNumber) {
                this.typeCurrent = newTypeNumber;
            }
        },
        notes: {
            immediate: true,
            handler: function (newText) {
                this.notesCurrent = newText;
            }
        }
    },
    mounted : function () {
        this.typelist.forEach((elem, index)=> {
            this.typeOptions.push({
                text: elem.title,
                value: String(index)
            })
        })
    },
    computed : {
        typeStr : function(){
            return this.typelist[this.typeCurrent].title;
        },
        typeVariant: function () {
            return this.typelist[this.typeCurrent].variant;
        }
    },
    created : function () {
    },
    methods : {
        clickPanelView: function () {
            this.isModeView = false;
            this.isModeEdit = true
        },
        clickBtnEditFinish: function () {
            this.isModeView = true;
            this.isModeEdit = false;
        }
    }
}
</script>

