export const styles = {
    container: "max-width: 1280px; margin: 0 auto; padding: 2rem;",
    card: "border: 1px solid var(--color-border); border-radius: var(--radius); background-color: var(--color-bg-paper); box-shadow: var(--shadow-sm); padding: 2rem;",
    input: "width: 100%; padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius); outline: none; transition: border-color 0.2s;",
    primaryButton: "display: inline-flex; align-items: center; justify-content: center; width: 100%; padding: 0.75rem 1.5rem; background-color: var(--color-primary); color: white; border-radius: var(--radius); font-weight: 500; border: none; transition: background-color 0.2s; outline: none;",
    secondaryButton: "display: inline-flex; align-items: center; color: var(--color-text-muted); background: white; border: 1px solid var(--color-border); padding: 0.75rem 1.5rem; border-radius: var(--radius); transition: background 0.1s;",

    // Custom helper classes for layout
    flexCenter: "display: flex; align-items: center; justify-content: center;",
    gridTwoCols: "display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;",
}
