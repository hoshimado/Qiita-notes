<template>
<div>
    <div>
        <b-navbar toggleable="lg" type="dark" variant="info">
            <b-navbar-brand href="#" @click="clickBrandTitle">アプリケーション名</b-navbar-brand>
            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
            <b-collapse id="nav-collapse" is-nav>
            
                <!-- (Default) Left aligned nav items -->
                <b-navbar-nav>
                    <b-nav-item @click="routerTag='/'">Home</b-nav-item>
                    <b-nav-item @click="routerTag='/useroptions'">設定</b-nav-item>
                </b-navbar-nav>

                <!-- Right aligned nav items -->
                <b-navbar-nav class="ml-auto">
                    <b-nav-item-dropdown right>
                        <!-- Using 'button-content' slot -->
                        <template #button-content>
                            <em>その他</em>
                        </template>
                        <b-dropdown-item @click="routerTag='/about'">About</b-dropdown-item>
                    </b-nav-item-dropdown>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
    </div>
    <div>
        <div v-if="isHome">
            <home-portal></home-portal>
        </div>
        <div v-if="isUserOption">
            <user-options></user-options>
        </div>
        <div v-if="isAbout">
            <about></about>
        </div>
    </div>
</div>
</template>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* Cssファイルはここへ配置する。 */


</style>


<script>
import { BNavbar, BNavbarBrand, BNavbarToggle, BCollapse, BNavItem, BNavbarNav, BNavItemDropdown, BDropdownItem } from 'bootstrap-vue';
import HomePortal from './HomePortal.vue';
import UserOptions from './UserOptions.vue';
import About from '../views/AboutView.vue';


export default {
    name : "MyClient",
    components: {
        BNavbar, BNavbarBrand, BNavbarToggle, BCollapse, BNavItem, BNavbarNav, BNavItemDropdown, BDropdownItem,
        HomePortal, UserOptions, About
    },
    props: {
    },
    data : function () {
        return {
            routerTag: '/'
        }
    },
    mounted : function () {
    },
    computed : {
        isUserOption: function() {
            return (this.routerTag=='/useroptions');
        },
        isAbout: function() {
            return (this.routerTag=='/about');
        },
        isHome: function() {
            return (this.routerTag=='/');
        }
    },
    created : function () {
    },
    watch : {
    },
    methods : {
        clickBrandTitle : function () {
            /* var result = */ alert('サイトトップへ移動（しない）');
        }
    }
}
</script>

