import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import targetVue from '@/components/MyClient.vue'

describe('MyClient.vue', () => {
  const factory = ()=>{
    return shallowMount(targetVue);
  };

  describe('スロットの設定したボタン動作', function () {
    it('ボタンを押すと、画像データが初期化（null）される', ()=>{
      const wrapper = factory();
      wrapper.setData({targetImage: "hoge"});

      expect(wrapper.vm.targetImage).to.be.not.null;
      wrapper.find('#id_close_button').trigger('click');
      expect(wrapper.vm.targetImage).to.be.null;
    });
    
  });
})
