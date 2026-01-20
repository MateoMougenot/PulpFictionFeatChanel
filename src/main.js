import AFRAME from "aframe";



// Configuration de l'animation des phares

const PHARES_CONFIG = {

  startDelay: 10500,     // Quand les phares commencent à arriver (augmenté)

  duration: 14000,       // Durée de l'approche (allongée - plus lente)

  flashStartTime: 23500, // Quand commence le flash blanc

  flashDuration: 1500,   // Durée du flash blanc

  flashEndTime: 25000,   // Quand le flash se termine

  fadeDuration: 2000     // Durée du fondu final

};



// Fonction pour animer les phares progressivement

function animateHeadlights() {

  const phareLeftSphere = document.querySelector('#phare-left-sphere');

  const phareLeftLight = document.querySelector('#phare-left-light');

  const phareRightSphere = document.querySelector('#phare-right-sphere');

  const phareRightLight = document.querySelector('#phare-right-light');

  const phareLeft = document.querySelector('#phare-left');

  const phareRight = document.querySelector('#phare-right');

  const flash = document.querySelector('#flash');

  const room = document.querySelector('#room');

  const scene1 = document.querySelector('#scene-1');

  const scene2 = document.querySelector('#scene-2');



  // Position initiale : très loin dans le Z négatif, très écartées

  phareLeft.setAttribute('position', { x: -2, y: 1.6, z: -5 });

  phareRight.setAttribute('position', { x: 2, y: 1.6, z: -5 });



  const startTime = PHARES_CONFIG.startDelay;

  const duration = PHARES_CONFIG.duration;

  const animationStart = Date.now();



  // Animation progressive

  const animationInterval = setInterval(() => {

    const elapsedSinceStart = Date.now() - animationStart;

    const elapsedSincePhareStart = elapsedSinceStart - startTime;



    // Phase 1: Approche lente des phares (0 à 10000ms)

    if (elapsedSincePhareStart >= 0 && elapsedSincePhareStart <= duration) {

      const progress = elapsedSincePhareStart / duration; // 0 à 1

     

      // Position : approche progressive vers le centre (restent écartées)

      const newZ = -5 + (4 * progress); // De -5 à -1 (plus près)

      const newX_left = -2 + (1.2 * progress); // De -2 à -0.8

      const newX_right = 2 - (1.2 * progress); // De 2 à 0.8



      phareLeft.setAttribute('position', { x: newX_left, y: 1.6, z: newZ });

      phareRight.setAttribute('position', { x: newX_right, y: 1.6, z: newZ });



      // Radius progressive : reste petit au début, puis grossit à la fin (derniers 30%)

      let radius;

      if (progress < 0.7) {

        // Les 70% premiers : restent petites (0.5)

        radius = 0.5;

      } else {

        // Les 30% restants : grossissent progressivement

        const growthProgress = (progress - 0.7) / 0.3; // 0 à 1 pour les 30% restants

        radius = 0.5 + (growthProgress * 3.5); // De 0.5 à 4

      }

      phareLeftSphere.setAttribute('radius', radius);

      phareRightSphere.setAttribute('radius', radius);



      // Intensité lumineuse progressive : augmente surtout à la fin

      let intensity;

      if (progress < 0.7) {

        // Les 70% premiers : lumière faible

        intensity = progress * 7.14; // De 0 à 5

      } else {

        // Les 30% restants : intensité monte rapidement

        const intensityProgress = (progress - 0.7) / 0.3;

        intensity = 5 + (intensityProgress * 45); // De 5 à 50

      }

      phareLeftLight.setAttribute('intensity', intensity);

      phareRightLight.setAttribute('intensity', intensity);



      // Augmentation de l'emissiveIntensity du matériau (suit la lumière)

      let emissiveIntensity;

      if (progress < 0.7) {

        emissiveIntensity = 0.5 + (progress * 1.07); // De 0.5 à 1.25

      } else {

        const emissiveProgress = (progress - 0.7) / 0.3;

        emissiveIntensity = 1.25 + (emissiveProgress * 2.25); // De 1.25 à 3.5

      }

      phareLeftSphere.setAttribute('material', { emissiveIntensity });

      phareRightSphere.setAttribute('material', { emissiveIntensity });

    }



    // Phase 2: Flash blanc (17500 à 19000ms)

    if (elapsedSinceStart >= PHARES_CONFIG.flashStartTime &&

        elapsedSinceStart <= PHARES_CONFIG.flashEndTime) {

      const flashProgress = (elapsedSinceStart - PHARES_CONFIG.flashStartTime) / PHARES_CONFIG.flashDuration;

      const flashOpacity = Math.min(flashProgress * 1.2, 1); // Sature à 1

      flash.setAttribute('material', { opacity: flashOpacity });



      // Masquer scene-1, montrer scene-2

      if (elapsedSinceStart >= PHARES_CONFIG.flashStartTime) {

        room.emit('reveal');

        scene1.setAttribute('visible', false);

      }

    }



    // Phase 3: Fondu progressif des phares + fondu du flash (19000ms+)

    if (elapsedSinceStart >= PHARES_CONFIG.flashEndTime) {

      const fadeProgress = (elapsedSinceStart - PHARES_CONFIG.flashEndTime) / PHARES_CONFIG.fadeDuration;

      const fadeOpacity = Math.max(1 - fadeProgress, 0);

     

      // Fondu du flash blanc

      flash.setAttribute('material', { opacity: fadeOpacity });



      // Fondu progressif des sphères (réduction de la visibilité)

      const sphereOpacity = Math.max(1 - fadeProgress, 0);

      phareLeftSphere.setAttribute('material', { opacity: sphereOpacity, transparent: true });

      phareRightSphere.setAttribute('material', { opacity: sphereOpacity, transparent: true });



      // Réduction progressive de l'intensité lumineuse

      const fadeIntensity = Math.max(50 - (fadeProgress * 50), 0);

      phareLeftLight.setAttribute('intensity', fadeIntensity);

      phareRightLight.setAttribute('intensity', fadeIntensity);



      scene2.setAttribute('visible', true);



      // Arrêter l'animation et nettoyer

      if (fadeOpacity <= 0) {

        clearInterval(animationInterval);

        // Masquer définitivement les phares

        phareLeft.setAttribute('visible', false);

        phareRight.setAttribute('visible', false);

      }

    }

  }, 10); // ~100 FPS pour plus de fluidité

}



// Démarrer l'animation quand la scène est prête

document.addEventListener('DOMContentLoaded', () => {

  const scene = document.querySelector('a-scene');

  if (scene.hasLoaded) {

    animateHeadlights();

  } else {

    scene.addEventListener('loaded', animateHeadlights);

  }

});