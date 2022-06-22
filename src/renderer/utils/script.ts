export async function loadScripts(scripts: string[]): Promise<void> {
  await Promise.all(
    scripts.map((url) => {
      const script = document.createElement('script');
      script.src = url;
      document.body.appendChild(script);

      return new Promise((resolve, reject) => {
        script.addEventListener('load', () => resolve(undefined));
        script.addEventListener('error', () => reject());
      });
    })
  );
}
