import {Castable, Command, command, param} from 'clime';

@command({
  description: 'Publish a PowerApp for Makeflow.',
})
export default class extends Command {
  async execute(
    @param({
      description: 'PowerApp file.',
      default: 'power-app.json',
    })
    file: Castable.File,
  ): Promise<void> {
    await file.assert();
  }
}
