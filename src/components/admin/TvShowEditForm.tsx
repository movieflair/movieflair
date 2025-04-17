
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MovieOrShow } from "@/lib/api";
import { LinkIcon, PlayCircle, Video } from "lucide-react";

interface TvShowEditFormProps {
  selectedTvShow: MovieOrShow;
  hasStream: boolean;
  hasTrailer: boolean;
  streamUrl: string;
  streamType: 'embed' | 'link';
  trailerUrl: string;
  setHasStream: (checked: boolean) => void;
  setHasTrailer: (checked: boolean) => void;
  setStreamType: (type: 'embed' | 'link') => void;
  setStreamUrl: (url: string) => void;
  setTrailerUrl: (url: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const TvShowEditForm = ({
  selectedTvShow,
  hasStream,
  hasTrailer,
  streamUrl,
  streamType,
  trailerUrl,
  setHasStream,
  setHasTrailer,
  setStreamType,
  setStreamUrl,
  setTrailerUrl,
  onSave,
  onCancel,
}: TvShowEditFormProps) => {
  return (
    <div className="border border-border rounded-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Serie bearbeiten</h3>
        <Button variant="ghost" onClick={onCancel} className="text-sm">
          Zurück zur Liste
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Titel</Label>
          <Input
            id="title"
            placeholder="Breaking Bad"
            className="mt-1"
            value={selectedTvShow.name || ''}
            readOnly
          />
        </div>

        <div>
          <Label htmlFor="year">Erscheinungsjahr</Label>
          <Input
            id="year"
            placeholder="2008"
            className="mt-1"
            value={selectedTvShow.first_air_date?.substring(0, 4) || ''}
            readOnly
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Beschreibung</Label>
          <textarea
            id="description"
            rows={3}
            className="w-full mt-1 p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Serien-Beschreibung..."
            value={selectedTvShow.overview || ''}
            readOnly
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <div className="text-lg font-medium mb-2">Einstellungen</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasStream"
                checked={hasStream}
                onCheckedChange={(checked) => setHasStream(checked as boolean)}
              />
              <Label htmlFor="hasStream" className="flex items-center gap-1">
                <PlayCircle className="w-4 h-4" />
                Stream verfügbar
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasTrailer"
                checked={hasTrailer}
                onCheckedChange={(checked) => setHasTrailer(checked as boolean)}
              />
              <Label htmlFor="hasTrailer" className="flex items-center gap-1">
                <Video className="w-4 h-4" />
                Als Trailer anzeigen
              </Label>
            </div>
          </div>
        </div>

        {hasStream && (
          <div className="md:col-span-2 space-y-4">
            <div>
              <Label className="mb-2 block">Stream URL Typ</Label>
              <RadioGroup
                value={streamType}
                onValueChange={(value) => setStreamType(value as 'embed' | 'link')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="embed" id="embed" />
                  <Label htmlFor="embed" className="flex items-center gap-1">
                    <PlayCircle className="w-4 h-4" />
                    Embed Code (Video Player)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="link" id="link" />
                  <Label htmlFor="link" className="flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    Direkt-Link (Weiterleitung)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="streamUrl">
                {streamType === 'embed' ? 'Stream URL (Embed Code)' : 'Stream URL (Direktlink)'}
              </Label>
              <Input
                id="streamUrl"
                placeholder={streamType === 'embed'
                  ? "https://www.youtube.com/embed/..."
                  : "https://www.example.com/watch?..."
                }
                className="mt-1"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
              />
            </div>
          </div>
        )}

        {hasTrailer && (
          <div className="md:col-span-2">
            <Label htmlFor="trailerUrl">Trailer URL (YouTube Embed)</Label>
            <Input
              id="trailerUrl"
              placeholder="https://www.youtube.com/embed/..."
              className="mt-1"
              value={trailerUrl}
              onChange={(e) => setTrailerUrl(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={onSave}>Speichern</Button>
      </div>
    </div>
  );
};

export default TvShowEditForm;
