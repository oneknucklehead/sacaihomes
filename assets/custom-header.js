document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.custom-header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('bg-[#1E2E1E]', 'shadow-lg', 'py-2');
      header.classList.remove('py-4');
    } else {
      header.classList.remove('bg-[#1E2E1E]', 'shadow-lg', 'py-2');
      header.classList.add('py-4');
    }
  });
});
