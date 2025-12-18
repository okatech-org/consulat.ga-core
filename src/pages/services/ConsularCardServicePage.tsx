import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Upload, CheckCircle, Clock, FileText, AlertCircle, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import iconConsularCard from "@/assets/icons/icon-consular-card.png";

export default function ConsularCardServicePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    birthPlace: "",
    profession: "",
    address: "",
    city: "",
    country: "",
    arrivalDate: "",
    phone: "",
    email: "",
    emergencyContact: "",
    emergencyPhone: "",
    comments: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Demande de carte consulaire soumise avec succès", {
      description: "Vous recevrez un email de confirmation sous 24h.",
    });
    setStep(3);
  };

  const requiredDocuments = [
    "Passeport gabonais valide",
    "Acte de naissance intégral",
    "2 photos d'identité récentes",
    "Justificatif de domicile actuel",
    "Attestation de résidence dans le pays",
  ];

  const benefits = [
    "Inscription au registre des Gabonais de l'étranger",
    "Facilitation des démarches consulaires",
    "Participation aux élections à l'étranger",
    "Assistance en cas d'urgence",
    "Accès aux services consulaires",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white py-16">
        <div className="container mx-auto px-4">
          <Link to="/services" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4" />
            Retour aux services
          </Link>
          <div className="flex items-center gap-6">
            <img src={iconConsularCard} alt="Carte Consulaire" className="h-20 w-20" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Carte Consulaire</h1>
              <p className="text-lg text-white/80">
                Inscription consulaire et obtention de votre carte
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? "bg-yellow-600 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                  </div>
                  <span className={`text-sm font-medium ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
                    {s === 1 ? "Identité" : s === 2 ? "Documents" : "Confirmation"}
                  </span>
                  {s < 3 && <div className={`w-12 h-1 ${step > s ? "bg-yellow-600" : "bg-muted"}`} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                    <CardDescription>Renseignez vos informations pour l'inscription consulaire</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom de famille *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="DUPONT"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom(s) *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Date de naissance *</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthPlace">Lieu de naissance *</Label>
                        <Input
                          id="birthPlace"
                          value={formData.birthPlace}
                          onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                          placeholder="Libreville, Gabon"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profession">Profession *</Label>
                      <Input
                        id="profession"
                        value={formData.profession}
                        onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                        placeholder="Ingénieur, Étudiant, etc."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse complète *</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="123 Rue de la République"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Ville *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Paris"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Pays de résidence *</Label>
                        <Select
                          value={formData.country}
                          onValueChange={(value) => setFormData({ ...formData, country: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FR">France</SelectItem>
                            <SelectItem value="US">États-Unis</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="BE">Belgique</SelectItem>
                            <SelectItem value="CH">Suisse</SelectItem>
                            <SelectItem value="DE">Allemagne</SelectItem>
                            <SelectItem value="GB">Royaume-Uni</SelectItem>
                            <SelectItem value="OTHER">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="arrivalDate">Date d'arrivée dans le pays *</Label>
                      <Input
                        id="arrivalDate"
                        type="date"
                        value={formData.arrivalDate}
                        onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">Contact d'urgence</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact">Nom du contact *</Label>
                          <Input
                            id="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                            placeholder="Nom complet"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyPhone">Téléphone *</Label>
                          <Input
                            id="emergencyPhone"
                            type="tel"
                            value={formData.emergencyPhone}
                            onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <Button onClick={() => setStep(2)} className="w-full bg-yellow-600 hover:bg-yellow-700">
                      Continuer vers les documents
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Documents requis</CardTitle>
                    <CardDescription>Téléchargez les documents nécessaires à votre inscription</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {requiredDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-yellow-300 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium">{doc}</p>
                          <p className="text-sm text-muted-foreground">Format: PDF, JPG, PNG (max 5 Mo)</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    ))}

                    <div className="space-y-2">
                      <Label htmlFor="comments">Informations complémentaires</Label>
                      <Textarea
                        id="comments"
                        value={formData.comments}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        placeholder="Précisions éventuelles..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        Retour
                      </Button>
                      <Button onClick={handleSubmit} className="flex-1 bg-yellow-600 hover:bg-yellow-700">
                        Soumettre la demande
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="text-center py-12">
                  <CardContent className="space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Demande envoyée !</h2>
                      <p className="text-muted-foreground">
                        Votre demande de carte consulaire a été soumise avec succès.<br />
                        Numéro de référence: <strong>CC-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}</strong>
                      </p>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" asChild>
                        <Link to="/services">Retour aux services</Link>
                      </Button>
                      <Button className="bg-yellow-600 hover:bg-yellow-700" asChild>
                        <Link to="/dashboard/citizen/requests">Suivre ma demande</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-yellow-600" />
                  Avantages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Délais et tarifs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span>Délai de traitement</span>
                  <span className="font-semibold">1-2 semaines</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span>Tarif adulte</span>
                  <span className="font-semibold">15 000 FCFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Validité</span>
                  <span className="font-semibold">5 ans</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-yellow-600 shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Retrait sur place</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      La carte consulaire doit être retirée en personne au consulat avec une pièce d'identité.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
