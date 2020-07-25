import { gsap } from 'gsap';
import $ from 'jquery';
import { random, sample, max } from 'lodash';
import { request_badwords, request_badword_detail } from './request';

const badwords_promise = request_badwords();

$(document).ready(async () => {
  const badwords = await badwords_promise;
  const $main = $('main');
  const $section_badwords = $('section#badwords');
  const $section_detail = $('section#detail');

  setInterval(function generate_ball() {
    const item = sample(badwords);
    const $ball = $(`<div class='ball' />`).text(item.label);

    $ball.appendTo($section_badwords);
    const tl = gsap.fromTo(
      $ball, 
      { y: '100vh', x: random(window.innerWidth - 50) },
      { y: '-100px', ease: 'linear', duration: random(8, 12), onComplete: () => $ball.remove() },
    );
    $ball.hover(
      () => tl.timeScale(0.7),
      () => tl.timeScale(1),
    );
    $ball.click(() => {
      tl.pause();
      const badword_detail_promise = request_badword_detail(item.id); // pre request
      const scale_up = gsap.fromTo($ball, { zIndex: 2 }, {
        x: '50vw', 
        y: '50vh', 
        scale: Math.PI * max([window.innerWidth, window.innerHeight]) / 100,
        transformOrigin: '50% 50%',
        duration: 1.5,
        ease: 'power2.inOut'
      });
      const fade_word = gsap.to($ball, { 
        color: 'transparent',
        duration: 1, 
      });
      
      const zoom_ball = gsap.timeline({
        onReverseComplete() { tl.resume(); },
        async onComplete() {
          const data = await badword_detail_promise;
          const defs = data.definitions.map(def => `
          <div class='definition'>
          <p>${def.message}</p>
          </div>
          `);
          const $detail = $(`
            <div class='container'>
              <div class='relative'>
                <h1>${item.label || data.label}<span class='noun'>(n.)</span></h1>
                <button class='absolute top-0 right-0 close'></button>
                <div>
                ${defs.join('')}
                </div>
              </div>
            </div>
          `);
          $section_badwords.hide();
          $section_detail.empty();

          $main.scrollTop($section_detail.offset().top);
          $detail.appendTo($section_detail);
          const fade_in = gsap.from($detail, { 
            autoAlpha: 0, 
            onReverseComplete() {
              $section_badwords.show();
              $main.scrollTop($section_badwords.offset().top);
              zoom_ball.reverse();
            } 
          });
          $detail.find('.close').click(() => {
            fade_in.reverse();
          });
        } 
      })
        .add(scale_up)
        .add(fade_word, '+=0.4')
    }); // on ball click

  }, 600);
});
