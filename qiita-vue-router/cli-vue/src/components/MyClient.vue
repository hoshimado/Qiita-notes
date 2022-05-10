<template>
<div>
    <div>
        <b-navbar toggleable="lg" type="dark" variant="info">
            <b-navbar-brand href="#" @click="clickBrandTitle">アプリケーション名</b-navbar-brand>
            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
            <b-collapse id="nav-collapse" is-nav>
            
                <!-- (Default) Left aligned nav items -->
                <b-navbar-nav>
                    <b-nav-item to="/">Home</b-nav-item>
                    <b-nav-item to="/useroptions">設定</b-nav-item>
                    <!-- 
                        Vue-Routerの「to」指定は、BootStrap Nav-itemでもサポートされている。
                        https://bootstrap-vue.org/docs/reference/router-links
                    -->
                </b-navbar-nav>

                <!-- Right aligned nav items -->
                <b-navbar-nav class="ml-auto">
                    <b-nav-item-dropdown right>
                        <!-- Using 'button-content' slot -->
                        <template #button-content>
                            <em>その他</em>
                        </template>
                        <b-dropdown-item to="/about">About</b-dropdown-item>
                    </b-nav-item-dropdown>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
    </div>
    <div>
        <!-- 表示するコンポーネント管理は、Vue-Routerに任せる -->
        <router-view/>
    </div>
</div>
</template>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* Cssファイルはここへ配置する。 */


</style>


<script>
import { BNavbar, BNavbarBrand, BNavbarToggle, BCollapse, BNavItem, BNavbarNav, BNavItemDropdown, BDropdownItem } from 'bootstrap-vue';


export default {
    name : "MyClient",
    components: {
        BNavbar, BNavbarBrand, BNavbarToggle, BCollapse, BNavItem, BNavbarNav, BNavItemDropdown, BDropdownItem
    },
    props: {
    },
    data : function () {
        return {
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
        /*
        clickBtnInput : function () {
            this.isInputAndHistoryView = true;
            this.isOptinsView          = false;
        },
        clickBtnSettingOptions : function () {
            this.isInputAndHistoryView = false;
            this.isOptinsView          = true;
        },
        */
        clickBrandTitle : function () {
            /* var result = */ alert('サイトトップへ移動（しない）');
        }
    }
}
</script>

