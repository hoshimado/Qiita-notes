<template>
<div>
    <div>
        <ul>
            <li v-for="(item,index) in activitylist" v-bind:key="index"> 
                <!-- (要素、配列番号)で受け取れる仕様 -->
                <item-card 
                    v-bind:typelist="typelist"
                    v-bind:datetime="item.datetime" 
                    v-bind:type="item.type" 
                    v-bind:notes="item.notes">
                </item-card>
            </li>
        </ul>
    </div>
</div>
</template>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* Cssファイルはここへ配置する。 */
ul li {
    margin: 16px;
    padding: 4px;
    background-color: burlywood;
}
</style>


<script>
// javascriptファイルをココへ。
import ItemCard from './ItemCard.vue';


export default {
    name : "ListItem",
    components: {
        ItemCard
    },
    props : {
    },
    data : function () {
        return {
            typelist : [
                { 
                    title: '寝た',
                    variant: 'primary'
                }, {
                    title: '起きた',
                    variant: 'secondary'
                }, {
                    title: '服薬',
                    variant: 'success'
                }
            ],
            activitylist: [
                {
                    id: 5,
                    datetime: "1596229200",
                    type: 1,
                    notes: '翌日の6時に起きたとする'
                },{
                    id: 4,
                    datetime: "1596223800",
                    type: 1,
                    notes: '翌日の4時半に目が覚めたとする'
                },{
                    id: 3,
                    datetime: "1596201000",
                    type: 0,
                    notes: '2020-07-31 22:10、つまり夜22時過ぎに寝た場合を仮定'
                },{
                    id: 2,
                    datetime: "1596164400",
                    type: 2,
                    notes: '薬を昼12時に飲んだとする。'
                }
            ]
        }
    },
    mounted : function () {
    },
    computed : {
    },
    created : function () {
    },
    watch : {
    },
    methods : {
    }
}
</script>

