<script setup>
import { onMounted, ref, useTemplateRef, onBeforeUnmount } from 'vue';
import { Dropdown, Modal } from 'bootstrap/dist/js/bootstrap.min';

const _generateUUID = () => window.crypto.randomUUID();
// 将来的に別ファイルに分けたり、windowsオブジェクト無しでのUT考慮で差し替えられるようにする想定。


const inputText = ref('');

const dropdownItems = ref([
    {id: 1, name: 'Action'},
    {id: 2, name: 'Another action'},
    {id: 3, name: 'Something else here'},
]);
const selectedDropdownItemName = ref('');
const onDropdownItemClick = (selectedId) => {
    selectedDropdownItemName.value = dropdownItems.value.find(item => item.id === selectedId).name;
};

const scopedIdCollapse1 = ref(_generateUUID());

const scopedIdModalDialog1 = ref(_generateUUID());
const debugMsg4Dialog1 = ref('');
let bsModalDialog1 = null;
const onConfirmModalDialog1 = () => {
    bsModalDialog1.hide();
    debugMsg4Dialog1.value = '保存ボタンが押されました。';
    setTimeout(() => {
        debugMsg4Dialog1.value = '';
    }, 3000);
};

const dropdownItemsCustom = ref([
    {id: 1, name: 'Action（選択して閉じる）'},
    {id: 2, name: 'Another action（選択されるが閉じない）'},
    {id: 3, name: 'Something else here'},
]);
const selectedDropdownItemNameCustom = ref('');
const elemDropdownList = useTemplateRef('refDropdownList');
let bsDropdownList = null;
const onDropdownItemClickCustom = (selectedId) => {
    selectedDropdownItemNameCustom.value = dropdownItemsCustom.value.find(item => item.id === selectedId).name;
    if(selectedId !== 2){
        bsDropdownList.hide();
    }
};

const debugMsgDropdownCustom2 = ref('');
const elemDropdownList2Parent = useTemplateRef('refDropdownListParent');
const _listenerHiddenBsDropdown = (event) => {
    console.log('hidden.bs.dropdown', event);
    debugMsgDropdownCustom2.value = 'ドロップダウンリストが閉じられました。';
};

onMounted(()=>{
    // モーダルダイアログの初期化
    bsModalDialog1 = Modal.getOrCreateInstance(document.getElementById(scopedIdModalDialog1.value));

    // ドロップダウンリスト1の処理
    bsDropdownList = Dropdown.getOrCreateInstance(elemDropdownList.value);

    // ドロップダウンリスト2の処理
    elemDropdownList2Parent.value.addEventListener(
        'hide.bs.dropdown', 
        _listenerHiddenBsDropdown
    );
});
onBeforeUnmount(() => { // https://ja.vuejs.org/api/composition-api-lifecycle#onunmounted
    // https://vueuse.org/core/useEventListener/ を使えば、umount時のこの考慮は
    // 不要となるが、そのためだけにimportするほどでもない、ので自前で実装する。
    elemDropdownList2Parent.value.removeEventListener(
        'hidden.bs.dropdown', 
        _listenerHiddenBsDropdown
    );
});
</script>



<template>
<div id="id-root"><!-- ラッパーは不要だが、Cssの都合でいったんこうする -->
    <div>
        <h3>静的コンポーネント：インプット</h3>
        <input 
            class="form-control"
            type="text" 
            placeholder="テキストを入力してください"
            v-model="inputText"
        ></input>
        <br><br>
        <div>
            [Debug]入力された文字列: {{inputText}}
        </div>
    </div>
    <hr><!-- ============================================= -->
    <div>
        <h3>動的コンポーネント：ドロップダウンリスト（Dropdowns）</h3>
        <div class="dropdown">
            <button 
                class="btn btn-secondary dropdown-toggle" 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
            >
                ドロップダウンリスト
            </button>
            <ul class="dropdown-menu">
                <li 
                    v-for="item in dropdownItems" 
                    :key="item.id"
                    class="dropdown-item"
                    @click="onDropdownItemClick(item.id)"
                >
                    {{item.name}}
                </li>
            </ul>
        </div>
        <div>
            [Debug]選択されたリスト要素: {{selectedDropdownItemName}}
        </div>
    </div>
    <hr><!-- ============================================= -->
    <div>
        <h3>動的コンポーネント：コラプス（collapse）</h3>
        <button 
            class="btn btn-primary" 
            type="button" 
            data-bs-toggle="collapse" 
            :data-bs-target="`#${scopedIdCollapse1}`" 
            aria-expanded="false" 
            :aria-controls="scopedIdCollapse1"
        >
            コラプスの開閉
        </button>
        <div class="collapse" :id="scopedIdCollapse1">
            <div class="card card-body">
                Some placeholder content for the collapse component. This panel is hidden by default but revealed when the user activates the relevant trigger.
            </div>
        </div>
    </div>
    <hr><!-- ============================================= -->
    <div>
        <h3>動的コンポーネント：モーダルダイアログ（modal dialog）</h3>
        <button 
            type="button" 
            class="btn btn-primary" 
            data-bs-toggle="modal" 
            :data-bs-target="`#${scopedIdModalDialog1}`"
        >
            モーダルダイアログを表示
        </button>
        <div>
            [Debug]ダイアログの結果: {{debugMsg4Dialog1}}
        </div>
        <div 
            class="modal fade" 
            :id="scopedIdModalDialog1" 
            tabindex="-1" 
            aria-labelledby="exampleModalLabel" 
            aria-hidden="true"
        >
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">モーダルダイアログのタイトル</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        モーダルダイアログの本文
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                        <button 
                            type="button" 
                            class="btn btn-primary"
                            @click="onConfirmModalDialog1"
                        >
                            保存
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <hr><!-- ============================================= -->
    <div>
        <h3>動的コンポーネント：ドロップダウンリスト（Dropdowns）、動作カスタム１</h3>
        <div class="input-group dropdown">
            <input 
                type="text" 
                class="form-control" 
                placeholder="選択されたリスト要素を挿入"
                v-model="selectedDropdownItemNameCustom"
            ></input>
            <button
                type="button" 
                class="btn btn-secondary dropdown-toggle dropdown-toggle-split"
                data-bs-auto-close="outside"
                data-bs-toggle="dropdown" 
            ></button>
            <ul 
                class="dropdown-menu" 
                ref="refDropdownList"
            >
                <li 
                    v-for="item in dropdownItemsCustom" 
                    :key="item.id"
                    class="dropdown-item"
                    @click="onDropdownItemClickCustom(item.id)"
                >
                    {{item.name}}
                </li>
            </ul>
        </div>
    </div>
    <hr><!-- ============================================= -->
    <div>
        <h3>動的コンポーネント：ドロップダウンリスト（Dropdowns）、動作カスタム２</h3>
        <div class="dropdown">
            <button 
                class="btn btn-secondary dropdown-toggle" 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                ref="refDropdownListParent"
            >
                ドロップダウンリスト
            </button>
            <ul class="dropdown-menu">
                <li 
                    v-for="item in dropdownItems" 
                    :key="item.id"
                    class="dropdown-item"
                >
                    {{item.name}}
                </li>
            </ul>
        </div>
        <div>
            [Debug]ドロップダウンリストの操作: {{debugMsgDropdownCustom2}}
        </div>
    </div>
</div>
</template>

<style scoped>
/* Cssファイルはここへ配置する。 */
#id-root {
    width: 100%;
}
#id_creating_contents{
    text-align: center;
}

</style>
