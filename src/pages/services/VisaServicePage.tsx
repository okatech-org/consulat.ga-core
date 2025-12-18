import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Upload, CheckCircle, Clock, FileText, AlertCircle, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import iconVisa from "@/assets/icons/icon-visa.png";

export default function VisaServicePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    nationality: "",
    passportNumber: "",
    passportExpiry: "",
    visaType: "",
    travelPurpose: "",
    arrivalDate: "",
    departureDate: "",
    accommodation: "",
    phone: "",
    email: "",
    comments: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Demande de visa soumise avec succès", {
      description: "Vous recevrez un email de confirmation sous 24h.",
    });
    setStep(3);
  };

  const visaTypes = [
    { id: "tourist", name: "Visa Touristique", duration: "30 jours", price: "70 000 FCFA" },
    { id: "business", name: "Visa Affaires", duration: "90 jours", price: "100 000 FCFA" },
    { id: "transit", name: "Visa Transit", duration: "72 heures", price: "25 000 FCFA" },
    { id: "long", name: "Visa Long Séjour", duration: "1 an", price: "150 000 FCFA" },
  ];

  const requiredDocuments = [
    "Passeport valide (6 mois minimum)",
    "2 photos d'identité récentes",
    "Billet d'avion aller-retour",
    "Réservation d'hébergement",
    "Attestation d'assurance voyage",
    "Justificatif de moyens financiers",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <Link to="/services" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4" />
            Retour aux services
          </Link>
          <div className="flex items-center gap-6">
            <img src={iconVisa} alt="Visa" className="h-20 w-20" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Demande de Visa</h1>
              <p className="text-lg text-white/80">
                Obtenez votre visa pour entrer au Gabon
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
                    step >= s ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                  </div>
                  <span className={`text-sm font-medium ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
                    {s === 1 ? "Voyage" : s === 2 ? "Documents" : "Confirmation"}
                  </span>
                  {s < 3 && <div className={`w-12 h-1 ${step > s ? "bg-blue-600" : "bg-muted"}`} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Informations de voyage</CardTitle>
                    <CardDescription>Renseignez les détails de votre séjour au Gabon</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Type de visa */}
                    <div className="space-y-4">
                      <Label>Type de visa *</Label>
                      <RadioGroup
                        value={formData.visaType}
                        onValueChange={(value) => setFormData({ ...formData, visaType: value })}
                        className="grid md:grid-cols-2 gap-4"
                      >
                        {visaTypes.map((visa) => (
                          <div key={visa.id} className="relative">
                            <RadioGroupItem value={visa.id} id={visa.id} className="peer sr-only" />
                            <Label
                              htmlFor={visa.id}
                              className="flex flex-col p-4 border-2 rounded-lg cursor-pointer hover:border-blue-300 peer-checked:border-blue-600 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-950/30"
                            >
                              <span className="font-semibold">{visa.name}</span>
                              <span className="text-sm text-muted-foreground">{visa.duration}</span>
                              <span className="text-sm font-medium text-blue-600">{visa.price}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom de famille *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Comme sur le passeport"
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
                        <Label htmlFor="nationality">Nationalité *</Label>
                        <Input
                          id="nationality"
                          value={formData.nationality}
                          onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                          placeholder="Française, Américaine, etc."
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="passportNumber">Numéro de passeport *</Label>
                        <Input
                          id="passportNumber"
                          value={formData.passportNumber}
                          onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                          placeholder="AB1234567"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passportExpiry">Date d'expiration *</Label>
                        <Input
                          id="passportExpiry"
                          type="date"
                          value={formData.passportExpiry}
                          onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="arrivalDate">Date d'arrivée prévue *</Label>
                        <Input
                          id="arrivalDate"
                          type="date"
                          value={formData.arrivalDate}
                          onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="departureDate">Date de départ prévue *</Label>
                        <Input
                          id="departureDate"
                          type="date"
                          value={formData.departureDate}
                          onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                          required
                        />
                      </div>
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

                    <div className="space-y-2">
                      <Label htmlFor="accommodation">Adresse d'hébergement au Gabon *</Label>
                      <Textarea
                        id="accommodation"
                        value={formData.accommodation}
                        onChange={(e) => setFormData({ ...formData, accommodation: e.target.value })}
                        placeholder="Hôtel, adresse résidentielle..."
                        required
                      />
                    </div>

                    <Button onClick={() => setStep(2)} className="w-full bg-blue-600 hover:bg-blue-700">
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
                    <CardDescription>Téléchargez les documents nécessaires à votre demande de visa</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {requiredDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-blue-300 transition-colors">
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
                      <Label htmlFor="comments">Motif détaillé du voyage</Label>
                      <Textarea
                        id="comments"
                        value={formData.comments}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        placeholder="Décrivez l'objectif de votre voyage..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        Retour
                      </Button>
                      <Button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
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
                        Votre demande de visa a été soumise avec succès.<br />
                        Numéro de référence: <strong>VIS-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}</strong>
                      </p>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" asChild>
                        <Link to="/services">Retour aux services</Link>
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700" asChild>
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
                  <Clock className="h-5 w-5 text-blue-600" />
                  Délais de traitement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span>Visa touristique</span>
                  <span className="font-semibold">5-7 jours</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span>Visa affaires</span>
                  <span className="font-semibold">7-10 jours</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span>Visa transit</span>
                  <span className="font-semibold">2-3 jours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Visa long séjour</span>
                  <span className="font-semibold">2-3 semaines</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-blue-600" />
                  Conditions d'entrée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    Passeport valide 6 mois après retour
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    Certificat de vaccination fièvre jaune
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    Billet retour confirmé
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">E-Visa disponible</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Pour certaines nationalités, le e-Visa est disponible en ligne avec un délai de traitement réduit.
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
